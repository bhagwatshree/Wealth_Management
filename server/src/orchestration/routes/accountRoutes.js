const router = require('express').Router();
const kycService = require('../services/kycService');
const screeningService = require('../services/screeningService');
const workflowStore = require('../store/workflowStore');

// GET /api/dxl/account/:customerId — aggregated account status for customer
router.get('/:customerId', async (req, res, next) => {
  try {
    const { customerId } = req.params;

    // Fetch KYC records
    const kycRecords = kycService.getKycByCustomer(customerId);
    const latestKyc = kycRecords.length > 0 ? kycRecords[kycRecords.length - 1] : null;

    // Fetch screening records
    const screeningRecords = screeningService.getScreeningsByCustomer(customerId);
    const latestScreening = screeningRecords.length > 0 ? screeningRecords[screeningRecords.length - 1] : null;

    // Fetch onboarding workflow
    const allWorkflows = workflowStore.getAll();
    const onboardingWorkflow = allWorkflows.find(
      (w) => w.customerId === customerId && w.type === 'ONBOARDING'
    );

    const kycStatus = latestKyc ? latestKyc.status : 'NOT_STARTED';
    const screeningStatus = latestScreening ? latestScreening.result : 'NOT_STARTED';
    const accountActive = kycStatus === 'VERIFIED' && screeningStatus === 'PASS';

    res.json({
      customerId,
      accountStatus: accountActive ? 'ACTIVE' : 'PENDING',
      kyc: latestKyc
        ? {
            kycId: latestKyc.kycId,
            status: latestKyc.status,
            steps: latestKyc.steps,
            submittedAt: latestKyc.submittedAt,
            verifiedAt: latestKyc.verifiedAt,
            rejectionReason: latestKyc.rejectionReason,
          }
        : { status: 'NOT_STARTED' },
      screening: latestScreening
        ? {
            screeningId: latestScreening.screeningId,
            result: latestScreening.result,
            riskScore: latestScreening.riskScore,
            checks: latestScreening.checks,
            screenedAt: latestScreening.screenedAt,
          }
        : { status: 'NOT_STARTED' },
      onboarding: onboardingWorkflow
        ? {
            workflowId: onboardingWorkflow.workflowId,
            status: onboardingWorkflow.status,
            steps: onboardingWorkflow.steps,
          }
        : null,
    });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
