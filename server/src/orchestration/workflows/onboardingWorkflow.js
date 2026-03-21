const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const workflowStore = require('../store/workflowStore');
const kycService = require('../services/kycService');
const screeningService = require('../services/screeningService');
const crmService = require('../services/crmService');
const cvmService = require('../services/cvmService');

const WORKFLOW_STATUS = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  SUSPENDED: 'SUSPENDED',
};

async function startOnboarding(customerData) {
  const workflowId = uuidv4();
  const workflow = {
    workflowId,
    type: 'ONBOARDING',
    customerId: customerData.customerId || uuidv4(),
    status: WORKFLOW_STATUS.IN_PROGRESS,
    currentStep: 0,
    steps: [
      { name: 'KYC_SUBMISSION', status: 'PENDING', result: null, startedAt: null, completedAt: null },
      { name: 'SCREENING', status: 'PENDING', result: null, startedAt: null, completedAt: null },
      { name: 'CRM_CREATION', status: 'PENDING', result: null, startedAt: null, completedAt: null },
      { name: 'WELCOME_CAMPAIGN', status: 'PENDING', result: null, startedAt: null, completedAt: null },
    ],
    customerData,
    createdAt: new Date().toISOString(),
  };

  workflowStore.set(workflowId, workflow);

  // Execute step 1: KYC
  await executeStep(workflowId, 0);
  return workflow;
}

async function executeStep(workflowId, stepIndex) {
  const workflow = workflowStore.get(workflowId);
  if (!workflow || stepIndex >= workflow.steps.length) return;

  const step = workflow.steps[stepIndex];
  step.status = 'IN_PROGRESS';
  step.startedAt = new Date().toISOString();
  workflow.currentStep = stepIndex;
  workflowStore.set(workflowId, workflow);

  try {
    let result;
    switch (step.name) {
      case 'KYC_SUBMISSION':
        result = await kycService.submitKyc(
          workflow.customerId,
          workflow.customerData,
          workflow.customerData.role || 'CUSTOMER'
        );
        step.result = result;
        step.status = 'COMPLETED';
        step.completedAt = new Date().toISOString();
        workflowStore.set(workflowId, workflow);

        // Auto-verify for workflow (in production, this waits for manual verification)
        await kycService.verifyKyc(result.kycId, 'APPROVE', 'Auto-approved via onboarding workflow');
        break;

      case 'SCREENING':
        result = await screeningService.screenCustomer(workflow.customerId, {
          firstName: workflow.customerData.firstName,
          lastName: workflow.customerData.lastName,
        });
        step.result = result;

        if (result.result === 'FLAGGED') {
          step.status = 'FLAGGED';
          step.completedAt = new Date().toISOString();
          workflow.status = WORKFLOW_STATUS.SUSPENDED;
          workflowStore.set(workflowId, workflow);
          eventBus.publish(events.WORKFLOW_FAILED, {
            workflowId,
            reason: 'Screening flagged — manual review required',
          });
          return;
        }

        step.status = 'COMPLETED';
        step.completedAt = new Date().toISOString();
        workflowStore.set(workflowId, workflow);
        break;

      case 'CRM_CREATION':
        // Get KYC and screening results from previous steps
        const kycResult = workflow.steps[0].result;
        const screeningResult = workflow.steps[1].result;

        result = await crmService.createCustomerProfile(workflow.customerId, {
          firstName: workflow.customerData.firstName,
          lastName: workflow.customerData.lastName,
          email: workflow.customerData.email,
          mobileNo: workflow.customerData.mobileNo,
          kyc: { kycId: kycResult?.kycId, status: 'VERIFIED' },
          screening: { screeningId: screeningResult?.screeningId, result: screeningResult?.result },
          fineractClientId: kycResult?.fineractClientId || null,
          segment: workflow.customerData.segment || 'STANDARD',
        });
        step.result = { profileId: result.profileId };
        step.status = 'COMPLETED';
        step.completedAt = new Date().toISOString();
        workflowStore.set(workflowId, workflow);
        break;

      case 'WELCOME_CAMPAIGN':
        // Find or create a welcome campaign
        const campaigns = cvmService.getAllCampaigns();
        let welcomeCampaign = campaigns.find((c) => c.name === 'Welcome Campaign');
        if (!welcomeCampaign) {
          welcomeCampaign = cvmService.createCampaign({
            name: 'Welcome Campaign',
            description: 'Automated welcome for new customers',
            channel: 'IN_APP',
            offerType: 'INFORMATION',
            offerTitle: 'Welcome to Wealth Management',
            offerBody: 'Your account is now active. Explore our investment products.',
          });
        }
        result = cvmService.triggerCampaign(welcomeCampaign.campaignId, [workflow.customerId]);
        step.result = { campaignId: welcomeCampaign.campaignId, dispatched: result.dispatched };
        step.status = 'COMPLETED';
        step.completedAt = new Date().toISOString();

        // All steps done
        workflow.status = WORKFLOW_STATUS.COMPLETED;
        workflowStore.set(workflowId, workflow);
        eventBus.publish(events.WORKFLOW_COMPLETED, { workflowId, customerId: workflow.customerId });
        return;
    }

    // Advance to next step
    eventBus.publish(events.WORKFLOW_STEP_COMPLETED, { workflowId, step: step.name, stepIndex });
    await executeStep(workflowId, stepIndex + 1);
  } catch (err) {
    step.status = 'FAILED';
    step.error = err.message;
    step.completedAt = new Date().toISOString();
    workflow.status = WORKFLOW_STATUS.FAILED;
    workflowStore.set(workflowId, workflow);
    eventBus.publish(events.WORKFLOW_FAILED, { workflowId, step: step.name, error: err.message });
  }
}

function getWorkflowStatus(workflowId) {
  return workflowStore.get(workflowId);
}

function getAllWorkflows() {
  return workflowStore.getAll();
}

module.exports = { startOnboarding, getWorkflowStatus, getAllWorkflows, WORKFLOW_STATUS };
