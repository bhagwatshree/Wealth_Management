const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');

// In-memory store for applications
const applications = [];

const APP_STATUS = {
  PENDING: 'PENDING',
  KYC_REQUIRED: 'KYC_REQUIRED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const APP_TYPES = {
  SAVINGS_ACCOUNT: 'SAVINGS_ACCOUNT',
  LOAN: 'LOAN',
  WEALTH_PRODUCT: 'WEALTH_PRODUCT',
};

function submitApplication({ customerId, customerName, customerEmail, type, productId, productName, amount, notes }) {
  const app = {
    id: uuidv4(),
    customerId,
    customerName: customerName || customerId,
    customerEmail: customerEmail || '',
    type,
    productId,
    productName: productName || '',
    amount: amount || null,
    notes: notes || '',
    status: APP_STATUS.PENDING,
    kycComplete: false,
    paymentId: null,
    paidAmount: null,
    paidAt: null,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: '',
  };

  applications.push(app);

  eventBus.publish('APPLICATION_SUBMITTED', {
    applicationId: app.id,
    customerId,
    type,
    productId,
  });

  return app;
}

function getApplicationsByCustomer(customerId) {
  return applications
    .filter((a) => a.customerId === customerId)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

function getAllApplications({ status, type } = {}) {
  let result = [...applications];
  if (status) result = result.filter((a) => a.status === status);
  if (type) result = result.filter((a) => a.type === type);
  return result.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

function getApplication(id) {
  return applications.find((a) => a.id === id) || null;
}

function markKycComplete(customerId) {
  const updated = [];
  applications.forEach((app) => {
    if (app.customerId === customerId) {
      app.kycComplete = true;
      // KYC_REQUIRED → PAYMENT_REQUIRED (next step is payment)
      if (app.status === APP_STATUS.KYC_REQUIRED) {
        app.status = APP_STATUS.PAYMENT_REQUIRED;
        app.reviewNotes = (app.reviewNotes ? app.reviewNotes + ' | ' : '') + 'KYC completed — payment required';
        updated.push(app);
      }
    }
  });
  if (updated.length > 0) {
    eventBus.publish('APPLICATION_KYC_CLEARED', { customerId, applicationIds: updated.map((a) => a.id) });
  }
  return updated;
}

function reviewApplication(id, { status, reviewedBy, reviewNotes }) {
  const app = applications.find((a) => a.id === id);
  if (!app) return { error: 'Application not found', code: 404 };

  // Only PENDING and KYC_REQUIRED can be reviewed
  if (![APP_STATUS.PENDING, APP_STATUS.KYC_REQUIRED].includes(app.status)) {
    return { error: `Cannot review — application status is ${app.status}`, code: 400 };
  }

  // KYC_REQUIRED: SP flags that customer needs KYC first
  if (status === APP_STATUS.KYC_REQUIRED) {
    app.status = APP_STATUS.KYC_REQUIRED;
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = reviewedBy || 'admin';
    app.reviewNotes = reviewNotes || 'KYC required before processing';
    eventBus.publish('APPLICATION_KYC_REQUIRED', {
      applicationId: app.id,
      customerId: app.customerId,
    });
    return { app };
  }

  // REJECTED: SP rejects
  if (status === APP_STATUS.REJECTED) {
    app.status = APP_STATUS.REJECTED;
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = reviewedBy || 'admin';
    app.reviewNotes = reviewNotes || '';
    eventBus.publish('APPLICATION_REJECTED', {
      applicationId: app.id,
      customerId: app.customerId,
      type: app.type,
      productId: app.productId,
    });
    return { app };
  }

  // APPROVED: SP approves → but needs KYC first, then payment
  if (status === APP_STATUS.APPROVED) {
    if (!app.kycComplete) {
      return { error: 'Cannot approve — KYC is not complete. Set status to KYC_REQUIRED first.', code: 400 };
    }
    // Move to PAYMENT_REQUIRED instead of direct approval
    app.status = APP_STATUS.PAYMENT_REQUIRED;
    app.reviewedAt = new Date().toISOString();
    app.reviewedBy = reviewedBy || 'admin';
    app.reviewNotes = reviewNotes || 'Approved pending payment';
    eventBus.publish('APPLICATION_PAYMENT_REQUIRED', {
      applicationId: app.id,
      customerId: app.customerId,
      type: app.type,
      productId: app.productId,
      amount: app.amount,
    });
    return { app };
  }

  return { error: 'Invalid status', code: 400 };
}

function getStats() {
  return {
    total: applications.length,
    pending: applications.filter((a) => a.status === APP_STATUS.PENDING).length,
    kycRequired: applications.filter((a) => a.status === APP_STATUS.KYC_REQUIRED).length,
    paymentRequired: applications.filter((a) => a.status === APP_STATUS.PAYMENT_REQUIRED).length,
    approved: applications.filter((a) => a.status === APP_STATUS.APPROVED).length,
    rejected: applications.filter((a) => a.status === APP_STATUS.REJECTED).length,
  };
}

module.exports = {
  submitApplication,
  getApplicationsByCustomer,
  getAllApplications,
  getApplication,
  markKycComplete,
  reviewApplication,
  getStats,
  APP_STATUS,
  APP_TYPES,
};
