module.exports = {
  // KYC
  KYC_SUBMITTED: 'kyc.submitted',
  KYC_VERIFIED: 'kyc.verified',
  KYC_REJECTED: 'kyc.rejected',

  // Screening
  SCREENING_REQUESTED: 'screening.requested',
  SCREENING_PASSED: 'screening.passed',
  SCREENING_FLAGGED: 'screening.flagged',

  // CRM
  CRM_CUSTOMER_CREATED: 'crm.customer.created',
  CRM_CUSTOMER_UPDATED: 'crm.customer.updated',

  // CVM
  CAMPAIGN_TRIGGERED: 'cvm.campaign.triggered',
  OFFER_GENERATED: 'cvm.offer.generated',

  // NAV / Batch
  NAV_BATCH_STARTED: 'nav.batch.started',
  NAV_BATCH_COMPLETED: 'nav.batch.completed',
  NAV_BATCH_FAILED: 'nav.batch.failed',

  // SFTP
  SFTP_FILE_RECEIVED: 'sftp.file.received',
  SFTP_FILE_PARSED: 'sftp.file.parsed',

  // Products
  PRODUCT_UPDATED: 'product.updated',

  // Workflows
  WORKFLOW_STEP_COMPLETED: 'workflow.step.completed',
  WORKFLOW_COMPLETED: 'workflow.completed',
  WORKFLOW_FAILED: 'workflow.failed',
};
