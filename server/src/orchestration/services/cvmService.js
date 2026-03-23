const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const Store = require('../store/Store');
const customerStore = require('../store/customerStore');

const campaignStore = new Store('campaigns');
// Tracks customers who have already received the welcome campaign (one-time only)
const welcomeAvailedStore = new Store('welcomeAvailed');

const CAMPAIGN_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
};

const CHANNELS = ['EMAIL', 'SMS', 'PUSH', 'IN_APP'];

function createCampaign(campaignData) {
  const campaignId = uuidv4();
  const campaign = {
    campaignId,
    name: campaignData.name,
    description: campaignData.description || '',
    status: CAMPAIGN_STATUS.DRAFT,
    channel: campaignData.channel || 'IN_APP',
    targeting: {
      segments: campaignData.segments || [],
      lifecycleStatuses: campaignData.lifecycleStatuses || [],
      minIncome: campaignData.minIncome || null,
      maxIncome: campaignData.maxIncome || null,
      productHoldings: campaignData.productHoldings || [],
    },
    offer: {
      type: campaignData.offerType || 'INFORMATION',
      title: campaignData.offerTitle || campaignData.name,
      body: campaignData.offerBody || '',
      cta: campaignData.cta || null,
    },
    triggerEvent: campaignData.triggerEvent || null,
    stats: { targeted: 0, dispatched: 0, opened: 0, converted: 0 },
    createdAt: new Date().toISOString(),
  };

  campaignStore.set(campaignId, campaign);
  return campaign;
}

function getCampaign(campaignId) {
  return campaignStore.get(campaignId);
}

function getAllCampaigns() {
  return campaignStore.getAll();
}

function updateCampaignStatus(campaignId, status) {
  const campaign = campaignStore.get(campaignId);
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);
  campaign.status = status;
  campaignStore.set(campaignId, campaign);
  return campaign;
}

function evaluateTargeting(campaignId) {
  const campaign = campaignStore.get(campaignId);
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

  const allCustomers = customerStore.getAll();
  const matched = allCustomers.filter((customer) => {
    const t = campaign.targeting;
    if (t.segments.length && !t.segments.includes(customer.segment)) return false;
    if (t.lifecycleStatuses.length && !t.lifecycleStatuses.includes(customer.lifecycleStatus)) return false;
    return true;
  });

  return matched.map((c) => c.customerId);
}

function triggerCampaign(campaignId, targetCustomerIds) {
  const campaign = campaignStore.get(campaignId);
  if (!campaign) throw new Error(`Campaign ${campaignId} not found`);

  const customerIds = targetCustomerIds || evaluateTargeting(campaignId);
  campaign.status = CAMPAIGN_STATUS.ACTIVE;
  campaign.stats.targeted = customerIds.length;
  campaign.stats.dispatched = customerIds.length;

  const dispatches = customerIds.map((customerId) => ({
    customerId,
    campaignId,
    channel: campaign.channel,
    offer: campaign.offer,
    dispatchedAt: new Date().toISOString(),
    status: 'SENT',
  }));

  campaignStore.set(campaignId, campaign);
  eventBus.publish(events.CAMPAIGN_TRIGGERED, { campaignId, customerIds, channel: campaign.channel });

  return { campaignId, dispatched: dispatches.length, dispatches };
}

// --- Welcome Campaign (one-time per customer) ---

function triggerWelcomeCampaign(customerId) {
  // Check if customer has already received the welcome campaign
  if (welcomeAvailedStore.get(customerId)) {
    return { alreadyAvailed: true, customerId };
  }

  // Find or create the welcome campaign
  const campaigns = campaignStore.getAll();
  let welcomeCampaign = campaigns.find((c) => c.name === 'Welcome Campaign');
  if (!welcomeCampaign) {
    welcomeCampaign = createCampaign({
      name: 'Welcome Campaign',
      description: 'One-time welcome for new customers',
      channel: 'IN_APP',
      offerType: 'INFORMATION',
      offerTitle: 'Welcome to Wealth Management',
      offerBody: 'Your account is now active. Explore our investment products.',
    });
  }

  const result = triggerCampaign(welcomeCampaign.campaignId, [customerId]);

  // Mark customer as availed — will not receive welcome campaign again
  welcomeAvailedStore.set(customerId, {
    customerId,
    campaignId: welcomeCampaign.campaignId,
    availedAt: new Date().toISOString(),
  });

  return { alreadyAvailed: false, ...result };
}

function hasAvailedWelcome(customerId) {
  return !!welcomeAvailedStore.get(customerId);
}

// Auto-trigger campaigns based on events (excludes welcome — that is triggered separately)
function setupEventTriggers() {
  eventBus.subscribe(events.KYC_VERIFIED, ({ payload }) => {
    const campaigns = campaignStore.find(
      (c) => c.triggerEvent === events.KYC_VERIFIED
        && c.status !== CAMPAIGN_STATUS.COMPLETED
        && c.name !== 'Welcome Campaign'
    );
    campaigns.forEach((campaign) => {
      triggerCampaign(campaign.campaignId, [payload.customerId]);
    });
  });

  eventBus.subscribe(events.CRM_CUSTOMER_CREATED, ({ payload }) => {
    const campaigns = campaignStore.find(
      (c) => c.triggerEvent === events.CRM_CUSTOMER_CREATED
        && c.status !== CAMPAIGN_STATUS.COMPLETED
        && c.name !== 'Welcome Campaign'
    );
    campaigns.forEach((campaign) => {
      triggerCampaign(campaign.campaignId, [payload.customerId]);
    });
  });

  // Welcome campaign triggers once when onboarding workflow completes (KYC + Screening done)
  eventBus.subscribe(events.WORKFLOW_COMPLETED, ({ payload }) => {
    if (payload.customerId) {
      triggerWelcomeCampaign(payload.customerId);
    }
  });
}

setupEventTriggers();

module.exports = {
  createCampaign, getCampaign, getAllCampaigns, updateCampaignStatus,
  evaluateTargeting, triggerCampaign, triggerWelcomeCampaign, hasAvailedWelcome,
  CAMPAIGN_STATUS, CHANNELS,
};
