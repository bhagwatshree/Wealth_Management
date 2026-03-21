const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const Store = require('../store/Store');
const customerStore = require('../store/customerStore');

const campaignStore = new Store('campaigns');

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

// Auto-trigger campaigns based on events
function setupEventTriggers() {
  eventBus.subscribe(events.KYC_VERIFIED, ({ payload }) => {
    const campaigns = campaignStore.find((c) => c.triggerEvent === events.KYC_VERIFIED && c.status !== CAMPAIGN_STATUS.COMPLETED);
    campaigns.forEach((campaign) => {
      triggerCampaign(campaign.campaignId, [payload.customerId]);
    });
  });

  eventBus.subscribe(events.CRM_CUSTOMER_CREATED, ({ payload }) => {
    const campaigns = campaignStore.find((c) => c.triggerEvent === events.CRM_CUSTOMER_CREATED && c.status !== CAMPAIGN_STATUS.COMPLETED);
    campaigns.forEach((campaign) => {
      triggerCampaign(campaign.campaignId, [payload.customerId]);
    });
  });
}

setupEventTriggers();

module.exports = { createCampaign, getCampaign, getAllCampaigns, updateCampaignStatus, evaluateTargeting, triggerCampaign, CAMPAIGN_STATUS, CHANNELS };
