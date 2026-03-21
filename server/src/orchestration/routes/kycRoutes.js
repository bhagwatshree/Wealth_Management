const router = require('express').Router();
const kycService = require('../services/kycService');

// POST /api/dxl/kyc/submit
router.post('/submit', async (req, res, next) => {
  try {
    const { customerId, kycData, role } = req.body;
    if (!customerId || !kycData) return res.status(400).json({ error: 'customerId and kycData are required' });
    const result = await kycService.submitKyc(customerId, kycData, role || 'CUSTOMER');
    res.status(201).json(result);
  } catch (e) { next(e); }
});

// GET /api/dxl/kyc/:id/status
router.get('/:id/status', async (req, res, next) => {
  try {
    const record = kycService.getKycStatus(req.params.id);
    if (!record) return res.status(404).json({ error: 'KYC record not found' });
    res.json(record);
  } catch (e) { next(e); }
});

// GET /api/dxl/kyc/customer/:customerId
router.get('/customer/:customerId', async (req, res, next) => {
  try {
    const records = kycService.getKycByCustomer(req.params.customerId);
    res.json(records);
  } catch (e) { next(e); }
});

// POST /api/dxl/kyc/:id/verify
router.post('/:id/verify', async (req, res, next) => {
  try {
    const { decision, notes } = req.body;
    if (!decision || !['APPROVE', 'REJECT'].includes(decision)) {
      return res.status(400).json({ error: 'decision must be APPROVE or REJECT' });
    }
    const result = await kycService.verifyKyc(req.params.id, decision, notes);
    res.json(result);
  } catch (e) { next(e); }
});

module.exports = router;
