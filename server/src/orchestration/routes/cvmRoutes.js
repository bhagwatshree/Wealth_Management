const router = require('express').Router();
const cvmService = require('../services/cvmService');

// GET /api/dxl/cvm/campaigns
router.get('/campaigns', async (req, res, next) => {
  try {
    res.json(cvmService.getAllCampaigns());
  } catch (e) { next(e); }
});

// POST /api/dxl/cvm/campaigns
router.post('/campaigns', async (req, res, next) => {
  try {
    if (!req.body.name) return res.status(400).json({ error: 'name is required' });
    const campaign = cvmService.createCampaign(req.body);
    res.status(201).json(campaign);
  } catch (e) { next(e); }
});

// GET /api/dxl/cvm/campaigns/:id
router.get('/campaigns/:id', async (req, res, next) => {
  try {
    const campaign = cvmService.getCampaign(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json(campaign);
  } catch (e) { next(e); }
});

// POST /api/dxl/cvm/campaigns/:id/trigger
router.post('/campaigns/:id/trigger', async (req, res, next) => {
  try {
    const result = cvmService.triggerCampaign(req.params.id, req.body.customerIds);
    res.json(result);
  } catch (e) { next(e); }
});

// PUT /api/dxl/cvm/campaigns/:id/status
router.put('/campaigns/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const campaign = cvmService.updateCampaignStatus(req.params.id, status);
    res.json(campaign);
  } catch (e) { next(e); }
});

// GET /api/dxl/cvm/campaigns/:id/targeting
router.get('/campaigns/:id/targeting', async (req, res, next) => {
  try {
    const customerIds = cvmService.evaluateTargeting(req.params.id);
    res.json({ campaignId: req.params.id, matchedCustomers: customerIds.length, customerIds });
  } catch (e) { next(e); }
});

// POST /api/dxl/cvm/welcome/:customerId — trigger one-time welcome campaign (admin use)
router.post('/welcome/:customerId', async (req, res, next) => {
  try {
    const result = cvmService.triggerWelcomeCampaign(req.params.customerId);
    if (result.alreadyAvailed) {
      return res.json({ message: 'Welcome campaign already availed', customerId: result.customerId });
    }
    res.json(result);
  } catch (e) { next(e); }
});

// GET /api/dxl/cvm/welcome/:customerId/status — check if customer has availed welcome campaign
router.get('/welcome/:customerId/status', async (req, res, next) => {
  try {
    const availed = cvmService.hasAvailedWelcome(req.params.customerId);
    res.json({ customerId: req.params.customerId, welcomeAvailed: availed });
  } catch (e) { next(e); }
});

module.exports = router;
