const router = require('express').Router();
const appService = require('../services/applicationService');

// Submit a new application (customer)
router.post('/', (req, res) => {
  const { customerId, customerName, customerEmail, type, productId, productName, amount, notes } = req.body;
  if (!customerId || !type || !productId) {
    return res.status(400).json({ error: 'customerId, type, and productId are required' });
  }
  const app = appService.submitApplication({ customerId, customerName, customerEmail, type, productId, productName, amount, notes });
  res.status(201).json(app);
});

// Get applications for a customer
router.get('/customer/:customerId', (req, res) => {
  const apps = appService.getApplicationsByCustomer(req.params.customerId);
  res.json(apps);
});

// Get all applications (admin)
router.get('/', (req, res) => {
  const { status, type } = req.query;
  const apps = appService.getAllApplications({ status, type });
  res.json(apps);
});

// Get application stats (admin)
router.get('/stats', (req, res) => {
  res.json(appService.getStats());
});

// Get single application
router.get('/:id', (req, res) => {
  const app = appService.getApplication(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  res.json(app);
});

// Mark KYC complete for a customer (called after KYC verification)
router.post('/kyc-complete/:customerId', (req, res) => {
  const updated = appService.markKycComplete(req.params.customerId);
  res.json({ message: `KYC marked complete. ${updated.length} application(s) moved back to PENDING.`, updated });
});

// Review an application (admin): APPROVED, REJECTED, or KYC_REQUIRED
router.post('/:id/review', (req, res) => {
  const { status, reviewedBy, reviewNotes } = req.body;
  if (!status || !['APPROVED', 'REJECTED', 'KYC_REQUIRED'].includes(status)) {
    return res.status(400).json({ error: 'status must be APPROVED, REJECTED, or KYC_REQUIRED' });
  }
  const result = appService.reviewApplication(req.params.id, { status, reviewedBy, reviewNotes });
  if (result.error) return res.status(result.code).json({ error: result.error });
  res.json(result.app);
});

module.exports = router;
