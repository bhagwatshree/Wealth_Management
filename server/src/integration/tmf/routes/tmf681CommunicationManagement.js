/**
 * TMF681 — Communication Management
 *
 * Standardized API for managing communications (CVM campaigns, notifications).
 * Maps to: orchestration/services/cvmService
 *
 * Resources:
 *   CommunicationMessage  — a campaign or notification to be sent to customers
 *
 * Endpoints:
 *   GET    /communicationMessage          — list campaigns/messages
 *   POST   /communicationMessage          — create a campaign
 *   GET    /communicationMessage/:id      — retrieve campaign details
 *   PATCH  /communicationMessage/:id      — update campaign
 *   POST   /communicationMessage/:id/send — dispatch campaign to targets
 */

const router = require('express').Router();
const { toTmfResource, toTmfCollection, sendTmfCollection } = require('../common/tmfEnvelope');
const { tmfErrors } = require('../common/tmfError');
const { requireFields } = require('../common/tmfValidator');
const cvmService = require('../../../orchestration/services/cvmService');

const TMF_TYPE = 'CommunicationMessage';
const BASE = '/tmf681/communicationMessage';

// -- Mappers --

function toTmfCommunication(campaign) {
  return {
    id: campaign.campaignId,
    content: campaign.offer?.body || campaign.description || '',
    subject: campaign.offer?.title || campaign.name,
    description: campaign.description,
    type: campaign.offer?.type || 'INFORMATION',
    status: mapStatusToTmf(campaign.status),
    priority: 'normal',
    sendTimeStamp: campaign.updatedAt || campaign.createdAt,
    characteristic: [
      { name: 'campaignName', value: campaign.name },
      { name: 'channel', value: campaign.channel },
      { name: 'triggerEvent', value: campaign.triggerEvent },
    ],
    sender: {
      id: 'WEALTH_PLATFORM',
      name: 'Wealth Management Platform',
      '@type': 'PartyRef',
    },
    receiver: campaign.stats ? [
      {
        id: 'targeted_group',
        name: `${campaign.stats.targeted} customers targeted`,
        '@type': 'PartyRef',
      },
    ] : [],
    attachment: campaign.offer?.cta ? [
      {
        name: 'Call To Action',
        url: campaign.offer.cta,
        '@type': 'Attachment',
      },
    ] : [],
    // Wealth-specific CVM extensions
    'x-cvmCampaign': {
      targeting: campaign.targeting,
      stats: campaign.stats,
      offer: campaign.offer,
    },
  };
}

function fromTmfCommunication(body) {
  return {
    name: body.subject || body.name || body.characteristic?.find((c) => c.name === 'campaignName')?.value || '',
    description: body.description || body.content || '',
    channel: body.characteristic?.find((c) => c.name === 'channel')?.value || body.channel || 'IN_APP',
    offerType: body.type || 'INFORMATION',
    offerTitle: body.subject || body.name || '',
    offerBody: body.content || body.description || '',
    cta: body.attachment?.find((a) => a.name === 'Call To Action')?.url || body.cta || null,
    triggerEvent: body.characteristic?.find((c) => c.name === 'triggerEvent')?.value || body.triggerEvent || null,
    segments: body['x-cvmCampaign']?.targeting?.segments || body.segments || [],
    lifecycleStatuses: body['x-cvmCampaign']?.targeting?.lifecycleStatuses || body.lifecycleStatuses || [],
    minIncome: body['x-cvmCampaign']?.targeting?.minIncome || body.minIncome || null,
    maxIncome: body['x-cvmCampaign']?.targeting?.maxIncome || body.maxIncome || null,
    productHoldings: body['x-cvmCampaign']?.targeting?.productHoldings || body.productHoldings || [],
  };
}

function mapStatusToTmf(status) {
  const map = { DRAFT: 'initial', ACTIVE: 'sent', PAUSED: 'suspended', COMPLETED: 'delivered' };
  return map[status] || 'initial';
}

// -- Routes --

// GET /communicationMessage
router.get('/communicationMessage', (req, res, next) => {
  try {
    const campaigns = cvmService.getAllCampaigns();
    const tmfMessages = campaigns.map(toTmfCommunication);
    const collection = toTmfCollection(tmfMessages, {
      type: TMF_TYPE,
      basePath: BASE,
      req,
    });
    sendTmfCollection(res, collection);
  } catch (e) { next(e); }
});

// POST /communicationMessage
router.post('/communicationMessage', (req, res, next) => {
  try {
    requireFields(req.body, ['subject']);
    const internal = fromTmfCommunication(req.body);
    const campaign = cvmService.createCampaign(internal);
    const tmf = toTmfResource(toTmfCommunication(campaign), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.status(201).json(tmf);
  } catch (e) { next(e); }
});

// GET /communicationMessage/:id
router.get('/communicationMessage/:id', (req, res, next) => {
  try {
    const campaign = cvmService.getCampaign(req.params.id);
    if (!campaign) throw tmfErrors.notFound('CommunicationMessage', req.params.id);
    const tmf = toTmfResource(toTmfCommunication(campaign), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.json(tmf);
  } catch (e) { next(e); }
});

// PATCH /communicationMessage/:id
router.patch('/communicationMessage/:id', (req, res, next) => {
  try {
    if (req.body.status) {
      const statusMap = { initial: 'DRAFT', sent: 'ACTIVE', suspended: 'PAUSED', delivered: 'COMPLETED' };
      const internal = statusMap[req.body.status] || req.body.status;
      const campaign = cvmService.updateCampaignStatus(req.params.id, internal);
      const tmf = toTmfResource(toTmfCommunication(campaign), {
        type: TMF_TYPE,
        basePath: BASE,
      });
      return res.json(tmf);
    }
    throw tmfErrors.badRequest('No updatable fields', 'Provide status to update');
  } catch (e) { next(e); }
});

// POST /communicationMessage/:id/send — dispatch campaign
router.post('/communicationMessage/:id/send', (req, res, next) => {
  try {
    const result = cvmService.triggerCampaign(req.params.id, req.body.receiver?.map((r) => r.id) || req.body.customerIds);
    res.json({
      '@type': 'CommunicationDispatchResult',
      communicationMessage: { id: req.params.id, '@type': 'CommunicationMessageRef' },
      dispatched: result.dispatched,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (e) { next(e); }
});

module.exports = router;
