const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const cvmService = require('../services/cvmService');

// Listen for CRM updates and evaluate campaign targeting
function init() {
  eventBus.subscribe(events.CRM_CUSTOMER_UPDATED, async ({ payload }) => {
    const { customerId } = payload;
    const campaigns = cvmService.getAllCampaigns().filter(
      (c) => c.status === 'ACTIVE' && c.triggerEvent === events.CRM_CUSTOMER_UPDATED
    );

    for (const campaign of campaigns) {
      const matched = cvmService.evaluateTargeting(campaign.campaignId);
      if (matched.includes(customerId)) {
        cvmService.triggerCampaign(campaign.campaignId, [customerId]);
        console.log(`[CampaignTrigger] Auto-dispatched campaign "${campaign.name}" to customer ${customerId}`);
      }
    }
  });

  console.log('[CampaignTrigger] Event triggers initialized');
}

module.exports = { init };
