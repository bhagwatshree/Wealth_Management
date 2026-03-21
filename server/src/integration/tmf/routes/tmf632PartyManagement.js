/**
 * TMF632 — Party Management
 *
 * Standardized API for managing parties (individuals/organizations) and their roles.
 * Maps to: orchestration/services/kycService + screeningService
 *
 * Resources:
 *   Individual       — a person (customer, fund manager, service provider)
 *   Organization     — an organizational entity
 *   PartyRole        — the role a party plays (KYC status, screening status)
 *
 * Endpoints:
 *   GET    /individual          — list individuals
 *   POST   /individual          — create an individual (triggers KYC)
 *   GET    /individual/:id      — retrieve individual with KYC/screening
 *   PATCH  /individual/:id      — update individual (verify KYC)
 */

const router = require('express').Router();
const { toTmfResource, toTmfCollection, sendTmfCollection } = require('../common/tmfEnvelope');
const { tmfErrors } = require('../common/tmfError');
const { requireFields, validateEnum } = require('../common/tmfValidator');
const kycService = require('../../../orchestration/services/kycService');
const screeningService = require('../../../orchestration/services/screeningService');

const TMF_TYPE = 'Individual';
const BASE = '/tmf632/individual';

// -- Mappers --

function toTmfIndividual(kycRecord) {
  return {
    id: kycRecord.kycId,
    givenName: kycRecord.data?.firstName || '',
    familyName: kycRecord.data?.lastName || '',
    fullName: `${kycRecord.data?.firstName || ''} ${kycRecord.data?.lastName || ''}`.trim(),
    gender: kycRecord.data?.gender || null,
    birthDate: kycRecord.data?.dateOfBirth || null,
    nationality: kycRecord.data?.nationality || null,
    status: kycRecord.status,
    partyCharacteristic: [
      { name: 'customerId', value: kycRecord.customerId },
      { name: 'role', value: kycRecord.role },
      { name: 'kycStatus', value: kycRecord.status },
      { name: 'fineractClientId', value: kycRecord.fineractClientId || null },
    ],
    individualIdentification: [
      kycRecord.data?.panNumber && {
        identificationId: kycRecord.data.panNumber,
        identificationType: 'PAN',
        issuingAuthority: 'Income Tax Department',
      },
      kycRecord.data?.aadhaarNumber && {
        identificationId: kycRecord.data.aadhaarNumber,
        identificationType: 'AADHAAR',
        issuingAuthority: 'UIDAI',
      },
    ].filter(Boolean),
    contactMedium: [
      kycRecord.data?.email && {
        mediumType: 'email',
        characteristic: { emailAddress: kycRecord.data.email },
      },
      kycRecord.data?.mobileNo && {
        mediumType: 'phone',
        characteristic: { phoneNumber: kycRecord.data.mobileNo },
      },
    ].filter(Boolean),
    relatedParty: [],
    // KYC verification steps
    'x-kycVerification': {
      steps: kycRecord.steps,
      submittedAt: kycRecord.submittedAt,
      verifiedAt: kycRecord.verifiedAt,
      rejectionReason: kycRecord.rejectionReason,
    },
  };
}

function fromTmfIndividual(body) {
  return {
    firstName: body.givenName || body.firstName || '',
    lastName: body.familyName || body.lastName || '',
    email: body.contactMedium?.find((c) => c.mediumType === 'email')?.characteristic?.emailAddress || body.email || '',
    mobileNo: body.contactMedium?.find((c) => c.mediumType === 'phone')?.characteristic?.phoneNumber || body.mobileNo || '',
    panNumber: body.individualIdentification?.find((i) => i.identificationType === 'PAN')?.identificationId || body.panNumber || '',
    aadhaarNumber: body.individualIdentification?.find((i) => i.identificationType === 'AADHAAR')?.identificationId || body.aadhaarNumber || '',
    dateOfBirth: body.birthDate || body.dateOfBirth || '',
    nationality: body.nationality || '',
    gender: body.gender || '',
  };
}

// -- Routes --

// POST /individual — submit KYC for a new individual
router.post('/individual', async (req, res, next) => {
  try {
    requireFields(req.body, ['givenName', 'familyName']);
    const kycData = fromTmfIndividual(req.body);
    const customerId = req.body.customerId || req.body.id;
    const role = req.body.partyCharacteristic?.find((c) => c.name === 'role')?.value || req.body.role || 'CUSTOMER';

    const result = await kycService.submitKyc(customerId, kycData, role);
    const record = kycService.getKycStatus(result.kycId);
    const tmf = toTmfResource(toTmfIndividual(record), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.status(201).json(tmf);
  } catch (e) { next(e); }
});

// GET /individual/:id — get individual with KYC status
router.get('/individual/:id', (req, res, next) => {
  try {
    const record = kycService.getKycStatus(req.params.id);
    if (!record) throw tmfErrors.notFound('Individual', req.params.id);

    const tmf = toTmfResource(toTmfIndividual(record), {
      type: TMF_TYPE,
      basePath: BASE,
    });

    // Attach screening results if available
    const screenings = screeningService.getScreeningsByCustomer(record.customerId);
    if (screenings.length > 0) {
      tmf['x-screening'] = screenings.map((s) => ({
        screeningId: s.screeningId,
        result: s.result,
        riskScore: s.riskScore,
        checks: s.checks,
        screenedAt: s.screenedAt,
      }));
    }

    res.json(tmf);
  } catch (e) { next(e); }
});

// PATCH /individual/:id — verify/reject KYC
router.patch('/individual/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) throw tmfErrors.badRequest('Missing status', 'Provide status: APPROVE or REJECT');

    const decision = status === 'VERIFIED' || status === 'APPROVE' ? 'APPROVE' : 'REJECT';
    const notes = req.body.statusReason || req.body.notes || '';
    const record = await kycService.verifyKyc(req.params.id, decision, notes);

    const tmf = toTmfResource(toTmfIndividual(record), {
      type: TMF_TYPE,
      basePath: BASE,
    });
    res.json(tmf);
  } catch (e) { next(e); }
});

// POST /individual/:id/screening — trigger screening for an individual
router.post('/individual/:id/screening', async (req, res, next) => {
  try {
    const record = kycService.getKycStatus(req.params.id);
    if (!record) throw tmfErrors.notFound('Individual', req.params.id);

    const result = await screeningService.screenCustomer(record.customerId, {
      firstName: record.data?.firstName,
      lastName: record.data?.lastName,
    });

    res.status(201).json({
      id: result.screeningId,
      '@type': 'PartyScreeningResult',
      individual: { id: req.params.id, '@type': 'IndividualRef' },
      result: result.result,
      riskScore: result.riskScore,
      checks: result.checks,
      details: result.details,
      screenedAt: result.screenedAt,
    });
  } catch (e) { next(e); }
});

module.exports = router;
