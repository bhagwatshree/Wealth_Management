/**
 * TMF629 — Customer Management
 *
 * Standardized API for managing customer records and 360-degree views.
 * Maps to: orchestration/services/crmService
 *
 * Resources:
 *   Customer — an individual or organization that has a relationship with the provider
 *
 * Endpoints:
 *   GET    /customer          — list customers
 *   POST   /customer          — create a customer
 *   GET    /customer/:id      — retrieve customer (360 view)
 *   PATCH  /customer/:id      — partial update
 */

const router = require('express').Router();
const { toTmfResource, toTmfCollection, sendTmfCollection } = require('../common/tmfEnvelope');
const { tmfErrors } = require('../common/tmfError');
const { requireFields } = require('../common/tmfValidator');
const crmService = require('../../../orchestration/services/crmService');

const TMF_TYPE = 'Customer';
const BASE = '/tmf629/customer';

// -- Mappers --

function toTmfCustomer(profile) {
  return {
    id: profile.profileId || profile.customerId,
    name: `${profile.personalInfo?.firstName || ''} ${profile.personalInfo?.lastName || ''}`.trim(),
    status: profile.lifecycleStatus === 'ACTIVE' ? 'approved' : profile.lifecycleStatus === 'CHURNED' ? 'closed' : 'initialized',
    statusReason: profile.lifecycleStatus,
    customerRank: profile.segment || 'STANDARD',
    validFor: {
      startDateTime: profile.createdAt,
      endDateTime: null,
    },
    engagedParty: {
      id: profile.profileId,
      name: `${profile.personalInfo?.firstName || ''} ${profile.personalInfo?.lastName || ''}`.trim(),
      '@type': 'Individual',
      '@referredType': 'Individual',
    },
    contactMedium: [
      profile.personalInfo?.email && {
        mediumType: 'email',
        preferred: true,
        characteristic: { emailAddress: profile.personalInfo.email },
      },
      profile.personalInfo?.mobileNo && {
        mediumType: 'phone',
        preferred: false,
        characteristic: { phoneNumber: profile.personalInfo.mobileNo },
      },
    ].filter(Boolean),
    relatedParty: profile.fineractClientId
      ? [{ id: String(profile.fineractClientId), role: 'FineractClient', '@type': 'RelatedParty' }]
      : [],
    characteristic: [
      { name: 'segment', value: profile.segment },
      { name: 'lifecycleStatus', value: profile.lifecycleStatus },
    ],
    // Wealth-specific extensions
    'x-wealthMgmt': {
      kyc: profile.kyc,
      screening: profile.screening,
      fineractClientId: profile.fineractClientId,
      fineractData: profile.fineractData || null,
      tags: profile.tags,
    },
  };
}

function fromTmfCustomer(body) {
  const names = (body.name || '').split(' ');
  return {
    customerId: body.id || body.customerId,
    firstName: body.engagedParty?.firstName || names[0] || body.firstName || '',
    lastName: body.engagedParty?.lastName || names.slice(1).join(' ') || body.lastName || '',
    email: body.contactMedium?.find((c) => c.mediumType === 'email')?.characteristic?.emailAddress || body.email || '',
    mobileNo: body.contactMedium?.find((c) => c.mediumType === 'phone')?.characteristic?.phoneNumber || body.mobileNo || '',
    segment: body.customerRank || body.segment || 'STANDARD',
    tags: body['x-wealthMgmt']?.tags || body.tags || [],
  };
}

// -- Routes --

// GET /customer
router.get('/customer', (req, res, next) => {
  try {
    const { status, search } = req.query;
    const lifecycleStatus = status === 'approved' ? 'ACTIVE' : status === 'closed' ? 'CHURNED' : req.query.lifecycleStatus;
    const segment = req.query.customerRank || req.query.segment;
    const customers = crmService.searchCustomers({ lifecycleStatus, segment, search });
    const tmfCustomers = customers.map(toTmfCustomer);
    const collection = toTmfCollection(tmfCustomers, {
      type: TMF_TYPE,
      basePath: BASE,
      req,
    });
    sendTmfCollection(res, collection);
  } catch (e) { next(e); }
});

// POST /customer
router.post('/customer', async (req, res, next) => {
  try {
    requireFields(req.body, ['name']);
    const internal = fromTmfCustomer(req.body);
    const profile = await crmService.createCustomerProfile(internal.customerId, internal);
    const tmf = toTmfResource(toTmfCustomer(profile), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.status(201).json(tmf);
  } catch (e) { next(e); }
});

// GET /customer/:id
router.get('/customer/:id', async (req, res, next) => {
  try {
    const profile = await crmService.getCustomer360(req.params.id);
    if (!profile) throw tmfErrors.notFound('Customer', req.params.id);
    const tmf = toTmfResource(toTmfCustomer(profile), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.json(tmf);
  } catch (e) { next(e); }
});

// PATCH /customer/:id
router.patch('/customer/:id', (req, res, next) => {
  try {
    if (req.body.status || req.body.statusReason) {
      const status = req.body.statusReason ||
        (req.body.status === 'approved' ? 'ACTIVE' : req.body.status === 'closed' ? 'CHURNED' : req.body.status);
      const profile = crmService.updateLifecycleStatus(req.params.id, status);
      const tmf = toTmfResource(toTmfCustomer(profile), {
        type: TMF_TYPE,
        basePath: BASE,
      });
      return res.json(tmf);
    }
    throw tmfErrors.badRequest('No updatable fields provided', 'Provide status or statusReason');
  } catch (e) { next(e); }
});

module.exports = router;
