const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const Store = require('../store/Store');
const { fineractApi } = require('../../services/fineractClient');

const kycStore = new Store('kyc');

const KYC_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

async function submitKyc(customerId, kycData, role) {
  const kycId = uuidv4();
  const record = {
    kycId,
    customerId,
    role,
    status: KYC_STATUS.PENDING,
    data: kycData,
    steps: buildStepsForRole(role),
    submittedAt: new Date().toISOString(),
    verifiedAt: null,
    rejectionReason: null,
  };

  kycStore.set(kycId, record);
  eventBus.publish(events.KYC_SUBMITTED, { kycId, customerId, role });
  return { kycId, status: record.status };
}

function buildStepsForRole(role) {
  const roleSteps = {
    CUSTOMER: [
      { name: 'Identity Verification', fields: ['panNumber', 'aadhaarNumber'], status: 'PENDING' },
      { name: 'Address Proof', fields: ['addressLine1', 'city', 'pincode'], status: 'PENDING' },
      { name: 'Financial Details', fields: ['annualIncome', 'occupation', 'sourceOfFunds'], status: 'PENDING' },
      { name: 'eKYC', fields: ['selfieUrl', 'videoVerification'], status: 'PENDING' },
    ],
    FUND_MANAGER: [
      { name: 'Organization Verification', fields: ['orgName', 'registrationNumber', 'cin'], status: 'PENDING' },
      { name: 'Regulatory Compliance', fields: ['sebiRegistration', 'amfiCode'], status: 'PENDING' },
      { name: 'Authorized Signatory', fields: ['signatoryName', 'designation', 'authorityLetter'], status: 'PENDING' },
      { name: 'eKYC', fields: ['orgDocuments'], status: 'PENDING' },
    ],
    SERVICE_PROVIDER: [
      { name: 'Organization Verification', fields: ['orgName', 'registrationNumber'], status: 'PENDING' },
      { name: 'System Access', fields: ['systemRole', 'accessLevel'], status: 'PENDING' },
      { name: 'Admin Verification', fields: ['adminApproval', 'securityClearance'], status: 'PENDING' },
      { name: 'eKYC', fields: ['orgDocuments'], status: 'PENDING' },
    ],
  };
  return roleSteps[role] || roleSteps.CUSTOMER;
}

function getKycStatus(kycId) {
  return kycStore.get(kycId);
}

function getKycByCustomer(customerId) {
  return kycStore.find((r) => r.customerId === customerId);
}

async function verifyKyc(kycId, decision, notes) {
  const record = kycStore.get(kycId);
  if (!record) throw new Error(`KYC record ${kycId} not found`);

  if (decision === 'APPROVE') {
    record.status = KYC_STATUS.VERIFIED;
    record.verifiedAt = new Date().toISOString();
    record.steps.forEach((s) => (s.status = 'COMPLETED'));
    kycStore.set(kycId, record);

    // Find or create Fineract client (client should already exist from signup)
    let fineractClientId = null;
    const email = record.customerId || '';
    const firstname = record.data.firstName || 'Unknown';
    const lastname = record.data.lastName || 'Unknown';

    // 1. Search by externalId (email)
    try {
      const { data } = await fineractApi.get('/clients', {
        params: { externalId: email, limit: 5 },
      });
      const clients = data.pageItems || data;
      if (Array.isArray(clients)) {
        const active = clients.find(c => c.status?.value !== 'Closed' && c.status?.id !== 600);
        if (active) {
          fineractClientId = active.id;
          console.log(`[KYC] Found existing Fineract client ${fineractClientId} for ${email}`);
        }
      }
    } catch (err) {
      console.log('[KYC] Client search by externalId failed:', err.message);
    }

    // 2. Fallback: search by displayName
    if (!fineractClientId) {
      try {
        const { data } = await fineractApi.get('/clients', {
          params: { displayName: `${firstname} ${lastname}`, limit: 5 },
        });
        const clients = data.pageItems || data;
        if (Array.isArray(clients)) {
          const active = clients.find(c => c.status?.value !== 'Closed' && c.status?.id !== 600);
          if (active) {
            fineractClientId = active.id;
            console.log(`[KYC] Found existing Fineract client ${fineractClientId} by name`);
          }
        }
      } catch (err) {
        console.log('[KYC] Client search by name failed:', err.message);
      }
    }

    // 3. Last resort: create new client
    if (!fineractClientId) {
      try {
        const clientPayload = {
          officeId: 1,
          legalFormId: 1,
          firstname,
          lastname,
          mobileNo: record.data.mobileNo || '',
          externalId: email,
          active: true,
          activationDate: formatFineractDate(new Date()),
          dateFormat: 'dd MMMM yyyy',
          locale: 'en',
        };
        const { data } = await fineractApi.post('/clients', clientPayload);
        fineractClientId = data.clientId || data.resourceId;
        console.log(`[KYC] Created new Fineract client ${fineractClientId} for ${email}`);
      } catch (err) {
        console.error('[KYC] Fineract client creation failed:', err.message);
      }
    }

    // Save address to Fineract client if available
    if (fineractClientId && record.data.address) {
      try {
        const addr = record.data.address;
        await fineractApi.post(`/client/${fineractClientId}/addresses`, {
          addressLine1: addr.addressLine1 || '',
          addressLine2: addr.addressLine2 || '',
          city: addr.city || '',
          stateProvinceId: addr.stateProvinceId || undefined,
          countryId: addr.countryId || undefined,
          postalCode: addr.postalCode || '',
          addressTypeId: 36, // Residential
        });
        console.log(`[KYC] Address saved to Fineract client ${fineractClientId}`);
      } catch (err) {
        console.warn('[KYC] Address save to Fineract failed (non-critical):', err.message);
      }
    }

    record.fineractClientId = fineractClientId;
    kycStore.set(kycId, record);

    eventBus.publish(events.KYC_VERIFIED, {
      kycId,
      customerId: record.customerId,
      fineractClientId,
    });
  } else {
    record.status = KYC_STATUS.REJECTED;
    record.rejectionReason = notes || 'Rejected by admin';
    kycStore.set(kycId, record);
    eventBus.publish(events.KYC_REJECTED, { kycId, customerId: record.customerId, reason: notes });
  }

  return record;
}

function formatFineractDate(date) {
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

module.exports = { submitKyc, getKycStatus, getKycByCustomer, verifyKyc, KYC_STATUS };
