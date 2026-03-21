const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const Store = require('../store/Store');

const screeningStore = new Store('screening');

// Mock screening adapter — replace with WorldCheck/Refinitiv adapter for production
class MockScreeningAdapter {
  async screen(personalData) {
    // Simulate screening delay
    await new Promise((r) => setTimeout(r, 100));

    // Mock: flag names containing "SANCTION" for testing
    const fullName = `${personalData.firstName || ''} ${personalData.lastName || ''}`.toUpperCase();
    const flagged = fullName.includes('SANCTION') || fullName.includes('PEP');

    return {
      result: flagged ? 'FLAGGED' : 'PASS',
      checks: {
        sanctions: { result: flagged ? 'HIT' : 'CLEAR', source: 'MockSanctionsList' },
        pep: { result: flagged ? 'HIT' : 'CLEAR', source: 'MockPEPDatabase' },
        adverseMedia: { result: 'CLEAR', source: 'MockMediaScan' },
      },
      riskScore: flagged ? 85 : 12,
      details: flagged ? 'Potential match found — manual review required' : 'No adverse findings',
    };
  }
}

const adapter = new MockScreeningAdapter();

async function screenCustomer(customerId, personalData) {
  const screeningId = uuidv4();

  eventBus.publish(events.SCREENING_REQUESTED, { screeningId, customerId });

  const adapterResult = await adapter.screen(personalData);

  const record = {
    screeningId,
    customerId,
    personalData: { firstName: personalData.firstName, lastName: personalData.lastName },
    result: adapterResult.result,
    checks: adapterResult.checks,
    riskScore: adapterResult.riskScore,
    details: adapterResult.details,
    screenedAt: new Date().toISOString(),
  };

  screeningStore.set(screeningId, record);

  if (adapterResult.result === 'PASS') {
    eventBus.publish(events.SCREENING_PASSED, { screeningId, customerId });
  } else {
    eventBus.publish(events.SCREENING_FLAGGED, { screeningId, customerId, riskScore: adapterResult.riskScore });
  }

  return record;
}

function getScreeningResult(screeningId) {
  return screeningStore.get(screeningId);
}

function getScreeningsByCustomer(customerId) {
  return screeningStore.find((r) => r.customerId === customerId);
}

module.exports = { screenCustomer, getScreeningResult, getScreeningsByCustomer };
