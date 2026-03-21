const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const customerStore = require('../store/customerStore');
const { fineractApi } = require('../../services/fineractClient');

const LIFECYCLE = {
  LEAD: 'LEAD',
  PROSPECT: 'PROSPECT',
  ACTIVE: 'ACTIVE',
  DORMANT: 'DORMANT',
  CHURNED: 'CHURNED',
};

async function createCustomerProfile(customerId, enrichmentData) {
  const profileId = customerId || uuidv4();

  const profile = {
    profileId,
    customerId: profileId,
    lifecycleStatus: LIFECYCLE.ACTIVE,
    personalInfo: {
      firstName: enrichmentData.firstName || '',
      lastName: enrichmentData.lastName || '',
      email: enrichmentData.email || '',
      mobileNo: enrichmentData.mobileNo || '',
    },
    kyc: enrichmentData.kyc || null,
    screening: enrichmentData.screening || null,
    fineractClientId: enrichmentData.fineractClientId || null,
    tags: enrichmentData.tags || [],
    segment: enrichmentData.segment || 'STANDARD',
    createdAt: new Date().toISOString(),
  };

  customerStore.set(profileId, profile);
  eventBus.publish(events.CRM_CUSTOMER_CREATED, { profileId, customerId: profileId });
  return profile;
}

async function getCustomer360(customerId) {
  const profile = customerStore.get(customerId);
  if (!profile) return null;

  // Enrich with live Fineract data if linked
  if (profile.fineractClientId) {
    try {
      const { data } = await fineractApi.get(`/clients/${profile.fineractClientId}`);
      profile.fineractData = {
        displayName: data.displayName,
        status: data.status,
        activationDate: data.activationDate,
        officeId: data.officeId,
        officeName: data.officeName,
      };
    } catch (err) {
      profile.fineractData = { error: 'Unable to fetch Fineract data' };
    }
  }

  return profile;
}

function updateLifecycleStatus(customerId, status) {
  const profile = customerStore.get(customerId);
  if (!profile) throw new Error(`Customer ${customerId} not found`);

  profile.lifecycleStatus = status;
  customerStore.set(customerId, profile);
  eventBus.publish(events.CRM_CUSTOMER_UPDATED, { customerId, lifecycleStatus: status });
  return profile;
}

function searchCustomers(filters = {}) {
  return customerStore.find((profile) => {
    if (filters.lifecycleStatus && profile.lifecycleStatus !== filters.lifecycleStatus) return false;
    if (filters.segment && profile.segment !== filters.segment) return false;
    if (filters.search) {
      const term = filters.search.toLowerCase();
      const name = `${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`.toLowerCase();
      if (!name.includes(term) && !profile.personalInfo.email.toLowerCase().includes(term)) return false;
    }
    return true;
  });
}

function getAllCustomers() {
  return customerStore.getAll();
}

module.exports = { createCustomerProfile, getCustomer360, updateLifecycleStatus, searchCustomers, getAllCustomers, LIFECYCLE };
