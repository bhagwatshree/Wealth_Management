const router = require('express').Router();
const screeningService = require('../services/screeningService');

// POST /api/dxl/screening/check
router.post('/check', async (req, res, next) => {
  try {
    const { customerId, personalData } = req.body;
    if (!customerId || !personalData) return res.status(400).json({ error: 'customerId and personalData are required' });
    const result = await screeningService.screenCustomer(customerId, personalData);
    res.status(201).json(result);
  } catch (e) { next(e); }
});

// GET /api/dxl/screening/:id
router.get('/:id', async (req, res, next) => {
  try {
    const result = screeningService.getScreeningResult(req.params.id);
    if (!result) return res.status(404).json({ error: 'Screening result not found' });
    res.json(result);
  } catch (e) { next(e); }
});

// GET /api/dxl/screening/customer/:customerId
router.get('/customer/:customerId', async (req, res, next) => {
  try {
    const results = screeningService.getScreeningsByCustomer(req.params.customerId);
    res.json(results);
  } catch (e) { next(e); }
});

module.exports = router;
