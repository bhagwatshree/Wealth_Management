const router = require('express').Router();
const { startOnboarding } = require('../workflows/onboardingWorkflow');

// POST /api/dxl/onboard
router.post('/', async (req, res, next) => {
  try {
    const { firstName, lastName, email, mobileNo, role, segment } = req.body;
    if (!firstName) {
      return res.status(400).json({ error: 'firstName is required' });
    }
    const resolvedLastName = lastName || firstName;
    console.log(`[Onboarding] Starting for ${firstName} ${resolvedLastName} (${email})`);
    const workflow = await startOnboarding({
      customerId: req.body.customerId,
      firstName,
      lastName: resolvedLastName,
      email,
      mobileNo,
      address: req.body.address,
      dateOfBirth: req.body.dateOfBirth,
      nationalId: req.body.nationalId,
      role: role || 'CUSTOMER',
      segment: segment || 'STANDARD',
    });
    res.status(201).json(workflow);
  } catch (e) {
    console.error('[Onboarding] Route error:', e.message, e.stack);
    next(e);
  }
});

module.exports = router;
