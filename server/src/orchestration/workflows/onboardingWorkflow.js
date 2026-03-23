const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');
const events = require('../../events/eventTypes');
const workflowStore = require('../store/workflowStore');
const kycService = require('../services/kycService');
const screeningService = require('../services/screeningService');

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
    ],
    customerData,
    createdAt: new Date().toISOString(),
  };

  workflowStore.set(workflowId, workflow);

  // Execute steps — errors are caught so the route doesn't crash
  try {
    await executeStep(workflowId, 0);
  } catch (err) {
    console.error(`[Onboarding] Workflow ${workflowId} failed:`, err.message);
    workflow.status = WORKFLOW_STATUS.FAILED;
    workflow.error = err.message;
    workflowStore.set(workflowId, workflow);
  }

  // Return the latest workflow state
  return workflowStore.get(workflowId) || workflow;
}

async function executeStep(workflowId, stepIndex) {
  const workflow = workflowStore.get(workflowId);
  if (!workflow) {
    console.error(`[Onboarding] Workflow ${workflowId} not found in store`);
    return;
  }
  if (stepIndex >= workflow.steps.length) {
    // All steps done
    workflow.status = WORKFLOW_STATUS.COMPLETED;
    workflowStore.set(workflowId, workflow);
    eventBus.publish(events.WORKFLOW_COMPLETED, { workflowId, customerId: workflow.customerId });
    return;
  }

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
        // KYC is submitted as PENDING — SP admin must verify via ManageKYC
        // Screening runs automatically after KYC is verified
        workflow.status = WORKFLOW_STATUS.IN_PROGRESS;
        workflowStore.set(workflowId, workflow);
        console.log(`[Onboarding] KYC submitted (${result.kycId}), awaiting SP admin verification`);
        // Do NOT advance to screening yet — wait for KYC verification event
        return;

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

/**
 * Initialize event listeners for the onboarding workflow.
 * When KYC is verified by SP admin, automatically run the screening step.
 */
function init() {
  eventBus.subscribe(events.KYC_VERIFIED, async (event) => {
    const customerId = event.payload?.customerId;
    if (!customerId) return;

    // Find the onboarding workflow for this customer that is still in progress
    const allWorkflows = workflowStore.getAll();
    const workflow = allWorkflows.find(
      (w) => w.customerId === customerId && w.type === 'ONBOARDING' && w.status === 'IN_PROGRESS'
    );
    if (!workflow) {
      console.log(`[Onboarding] No in-progress workflow found for ${customerId} after KYC verified`);
      return;
    }

    console.log(`[Onboarding] KYC verified for ${customerId}, advancing to screening step`);
    try {
      await executeStep(workflow.workflowId, 1); // Run screening
    } catch (err) {
      console.error(`[Onboarding] Screening step failed for ${customerId}:`, err.message);
    }
  });

  console.log('[Onboarding] Onboarding workflow event listeners initialized');
}

module.exports = { startOnboarding, getWorkflowStatus, getAllWorkflows, init, WORKFLOW_STATUS };
