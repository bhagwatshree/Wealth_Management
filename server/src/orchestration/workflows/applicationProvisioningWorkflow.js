/**
 * Application Provisioning Workflow
 *
 * Listens for APPLICATION_APPROVED events and creates the corresponding
 * account/loan in Fineract. Updates the application record with the
 * Fineract resource IDs.
 */
const eventBus = require('../../events/eventBus');
const { fineractApi } = require('../../services/fineractClient');
const applicationService = require('../services/applicationService');

function formatFineractDate(date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

/**
 * Ensure a Fineract client exists for the customer.
 * Looks up by externalId (email), then by name. Client should already exist from signup.
 */
async function ensureFineractClient(application) {
  const email = application.customerEmail || application.customerId;
  const name = application.customerName || 'Unknown';
  const parts = name.trim().split(/\s+/);
  const firstname = parts[0] || 'Unknown';
  const lastname = parts.slice(1).join(' ') || firstname;

  // Try to find by externalId (email) — this is set at signup, skip closed clients
  try {
    const { data } = await fineractApi.get('/clients', {
      params: { externalId: email, limit: 5 },
    });
    const clients = data.pageItems || data;
    if (Array.isArray(clients)) {
      const active = clients.find(c => c.status?.value !== 'Closed' && c.status?.id !== 600);
      if (active) {
        console.log(`[Provisioning] Found existing Fineract client ${active.id} for ${email}`);
        return active.id;
      }
    }
  } catch (err) {
    console.log('[Provisioning] Client search by externalId failed:', err.message);
  }

  // Fallback: search by displayName — skip closed clients
  try {
    const { data } = await fineractApi.get('/clients', {
      params: { displayName: name, limit: 5 },
    });
    const clients = data.pageItems || data;
    if (Array.isArray(clients)) {
      const active = clients.find(c => c.status?.value !== 'Closed' && c.status?.id !== 600);
      if (active) {
        console.log(`[Provisioning] Found existing Fineract client ${active.id} by name for ${name}`);
        return active.id;
      }
    }
  } catch (err) {
    console.log('[Provisioning] Client search by name failed:', err.message);
  }

  // Last resort: create new (shouldn't happen if signup works)
  console.warn(`[Provisioning] No Fineract client found for ${email}, creating new one`);
  const clientPayload = {
    officeId: 1,
    legalFormId: 1,
    firstname,
    lastname,
    externalId: email,
    active: true,
    activationDate: formatFineractDate(new Date()),
    dateFormat: 'dd MMMM yyyy',
    locale: 'en',
  };

  const { data } = await fineractApi.post('/clients', clientPayload);
  return data.clientId || data.resourceId;
}

/**
 * Create a savings account in Fineract
 */
async function provisionSavingsAccount(application, clientId) {
  const payload = {
    clientId,
    productId: Number(application.productId),
    locale: 'en',
    dateFormat: 'dd MMMM yyyy',
    submittedOnDate: formatFineractDate(new Date()),
  };

  const { data } = await fineractApi.post('/savingsaccounts', payload);
  const savingsId = data.savingsId || data.resourceId;

  // Auto-approve the savings account
  try {
    await fineractApi.post(`/savingsaccounts/${savingsId}`, {
      approvedOnDate: formatFineractDate(new Date()),
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
    }, { params: { command: 'approve' } });

    // Auto-activate
    await fineractApi.post(`/savingsaccounts/${savingsId}`, {
      activatedOnDate: formatFineractDate(new Date()),
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
    }, { params: { command: 'activate' } });
  } catch (err) {
    console.warn('[Provisioning] Savings auto-approve/activate failed:', err.message);
  }

  return { savingsId, fineractClientId: clientId };
}

/**
 * Create a loan application in Fineract
 */
async function provisionLoan(application, clientId) {
  // Fetch the loan product to get default terms
  let productDefaults = {};
  try {
    const { data: product } = await fineractApi.get(`/loanproducts/${application.productId}`);
    productDefaults = {
      principal: application.amount || product.principal || product.minPrincipal || 10000,
      loanTermFrequency: product.numberOfRepayments || 12,
      loanTermFrequencyType: product.repaymentFrequencyType?.id || 2, // months
      numberOfRepayments: product.numberOfRepayments || 12,
      repaymentEvery: product.repaymentEvery || 1,
      repaymentFrequencyType: product.repaymentFrequencyType?.id || 2,
      interestRatePerPeriod: product.interestRatePerPeriod || 5,
      amortizationType: product.amortizationType?.id || 1,
      interestType: product.interestType?.id || 0,
      interestCalculationPeriodType: product.interestCalculationPeriodType?.id || 1,
      transactionProcessingStrategyCode: product.transactionProcessingStrategyCode || 'mifos-standard-strategy',
    };
  } catch (err) {
    console.warn('[Provisioning] Could not fetch loan product defaults:', err.message);
    productDefaults = {
      principal: application.amount || 10000,
      loanTermFrequency: 12,
      loanTermFrequencyType: 2,
      numberOfRepayments: 12,
      repaymentEvery: 1,
      repaymentFrequencyType: 2,
      interestRatePerPeriod: 5,
      amortizationType: 1,
      interestType: 0,
      interestCalculationPeriodType: 1,
      transactionProcessingStrategyCode: 'mifos-standard-strategy',
    };
  }

  const payload = {
    clientId,
    productId: Number(application.productId),
    locale: 'en',
    dateFormat: 'dd MMMM yyyy',
    submittedOnDate: formatFineractDate(new Date()),
    expectedDisbursementDate: formatFineractDate(new Date()),
    ...productDefaults,
  };

  const { data } = await fineractApi.post('/loans', payload);
  const loanId = data.loanId || data.resourceId;

  return { loanId, fineractClientId: clientId };
}

/**
 * Initialize the provisioning workflow listener
 */
function init() {
  eventBus.subscribe('APPLICATION_APPROVED', async (event) => {
    const { applicationId, type, productId } = event.payload || event;
    const application = applicationService.getApplication(applicationId);
    if (!application) {
      console.error('[Provisioning] Application not found:', applicationId);
      return;
    }

    console.log(`[Provisioning] Processing approved application ${applicationId} (type: ${type})`);

    try {
      const clientId = await ensureFineractClient(application);
      let result = {};

      if (type === 'SAVINGS_ACCOUNT') {
        result = await provisionSavingsAccount(application, clientId);
        console.log(`[Provisioning] Savings account created: ${result.savingsId} for client ${clientId}`);
      } else if (type === 'LOAN') {
        result = await provisionLoan(application, clientId);
        console.log(`[Provisioning] Loan created: ${result.loanId} for client ${clientId}`);
      } else if (type === 'WEALTH_PRODUCT') {
        // Wealth products are managed in our offer catalog, not Fineract
        result = { fineractClientId: clientId, note: 'Wealth product — no Fineract provisioning needed' };
        console.log(`[Provisioning] Wealth product approved for client ${clientId}`);
      }

      // Store Fineract IDs back on the application
      application.fineractClientId = clientId;
      application.fineractResourceId = result.savingsId || result.loanId || null;
      application.provisionedAt = new Date().toISOString();
      application.provisioningStatus = 'SUCCESS';

      eventBus.publish('APPLICATION_PROVISIONED', {
        applicationId,
        type,
        clientId,
        resourceId: application.fineractResourceId,
      });
    } catch (err) {
      console.error(`[Provisioning] Failed for application ${applicationId}:`, err.message);
      application.provisioningStatus = 'FAILED';
      application.provisioningError = err.message;
    }
  });

  // When KYC is verified, mark all that customer's applications as KYC complete
  eventBus.subscribe('kyc.verified', (event) => {
    const customerId = event.payload?.customerId || event.customerId;
    if (!customerId) return;
    const updated = applicationService.markKycComplete(customerId);
    if (updated.length > 0) {
      console.log(`[Provisioning] KYC verified for ${customerId} — ${updated.length} application(s) moved to PENDING`);
    }
  });

  console.log('[Provisioning] Application provisioning workflow initialized');
}

module.exports = { init };
