const router = require('express').Router();
const crmService = require('../services/crmService');

// POST /api/dxl/crm/customers
router.post('/customers', async (req, res, next) => {
  try {
    const profile = await crmService.createCustomerProfile(req.body.customerId, req.body);
    res.status(201).json(profile);
  } catch (e) { next(e); }
});

// GET /api/dxl/crm/customers
router.get('/customers', async (req, res, next) => {
  try {
    const { lifecycleStatus, segment, search } = req.query;
    const results = crmService.searchCustomers({ lifecycleStatus, segment, search });
    res.json(results);
  } catch (e) { next(e); }
});

// GET /api/dxl/crm/customers/:id
router.get('/customers/:id', async (req, res, next) => {
  try {
    const profile = await crmService.getCustomer360(req.params.id);
    if (!profile) return res.status(404).json({ error: 'Customer not found' });
    res.json(profile);
  } catch (e) { next(e); }
});

// PUT /api/dxl/crm/customers/:id/lifecycle
router.put('/customers/:id/lifecycle', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status is required' });
    const profile = crmService.updateLifecycleStatus(req.params.id, status);
    res.json(profile);
  } catch (e) { next(e); }
});

module.exports = router;
