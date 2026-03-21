const router = require('express').Router();
const { startOnboarding } = require('../workflows/onboardingWorkflow');

// POST /api/dxl/onboard
router.post('/', async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobileNo, role, segment } = req.body;
    if (!firstName || !lastName) {
      return res.status(400).json({ error: 'firstName and lastName are required' });
    }
    const workflow = await startOnboarding({
      customerId: req.body.customerId,
      firstName,
      lastName,
      email,
      mobileNo,
      role: role || 'CUSTOMER',
      segment: segment || 'STANDARD',
    });
    res.status(201).json(workflow);
  } catch (e) { next(e); }
});

module.exports = router;
