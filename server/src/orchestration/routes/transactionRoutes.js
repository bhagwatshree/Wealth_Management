const router = require('express').Router();
const txnService = require('../services/transactionService');
const appService = require('../services/applicationService');

// Make a payment for an application (customer)
router.post('/pay', (req, res) => {
  const { customerId, customerName, applicationId, amount, currency, paymentMethod } = req.body;
  if (!customerId || !applicationId || !amount) {
    return res.status(400).json({ error: 'customerId, applicationId, and amount are required' });
  }

  const app = appService.getApplication(applicationId);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  if (app.status !== 'PAYMENT_REQUIRED') {
    return res.status(400).json({ error: `Payment not expected — application status is ${app.status}` });
  }

  const txn = txnService.createTransaction({
    customerId,
    customerName,
    applicationId,
    type: 'PAYMENT',
    amount,
    currency: currency || 'TZS',
    description: `Payment for ${app.productName || app.type} via ${paymentMethod || 'M-Pesa'}`,
    productName: app.productName,
    creditAccount: 'PLATFORM_HOLDING',
    debitAccount: `CUSTOMER_${customerId}`,
    reference: `PAY-${applicationId.slice(0, 8)}`,
  });

  // Mark application as paid — move to APPROVED
  app.status = 'APPROVED';
  app.paymentId = txn.id;
  app.paidAmount = txn.amount;
  app.paidAt = txn.createdAt;
  app.reviewedAt = new Date().toISOString();
  app.reviewNotes = (app.reviewNotes ? app.reviewNotes + ' | ' : '') + `Payment received: ${amount} ${currency || 'TZS'}`;

  // Trigger provisioning
  const eventBus = require('../../events/eventBus');
  eventBus.publish('APPLICATION_APPROVED', {
    applicationId: app.id,
    customerId: app.customerId,
    type: app.type,
    productId: app.productId,
  });

  res.json({ transaction: txn, application: app });
});

// Get transactions for a customer
router.get('/customer/:customerId', (req, res) => {
  const { type, accountId, limit, offset } = req.query;
  const result = txnService.getTransactionsByCustomer(req.params.customerId, {
    type, accountId, limit: Number(limit) || 100, offset: Number(offset) || 0,
  });
  res.json(result);
});

// Get transactions for an application
router.get('/application/:applicationId', (req, res) => {
  const txns = txnService.getTransactionsByApplication(req.params.applicationId);
  res.json(txns);
});

// Get all transactions (admin)
router.get('/', (req, res) => {
  const { customerId, type, status, dateFrom, dateTo, limit, offset } = req.query;
  const result = txnService.getAllTransactions({
    customerId, type, status, dateFrom, dateTo,
    limit: Number(limit) || 200, offset: Number(offset) || 0,
  });
  res.json(result);
});

// Get ledger summary (admin)
router.get('/ledger/summary', (req, res) => {
  res.json(txnService.getLedgerSummary());
});

// Get customer balance
router.get('/balance/:customerId', (req, res) => {
  const { accountId } = req.query;
  const balance = txnService.getAccountBalance(req.params.customerId, accountId);
  res.json({ customerId: req.params.customerId, balance, accountId: accountId || null });
});

// Get single transaction
router.get('/:id', (req, res) => {
  const txn = txnService.getTransaction(req.params.id);
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  res.json(txn);
});

// Credit interest (admin manual or scheduled)
router.post('/interest', (req, res) => {
  const { customerId, customerName, accountId, amount, currency, type } = req.body;
  if (!customerId || !amount) {
    return res.status(400).json({ error: 'customerId and amount are required' });
  }
  const txn = txnService.createTransaction({
    customerId,
    customerName,
    accountId,
    type: type === 'DEBIT' ? 'INTEREST_DEBIT' : 'INTEREST_CREDIT',
    amount,
    currency: currency || 'TZS',
    description: type === 'DEBIT' ? 'Interest charge' : 'Interest credited',
    creditAccount: type === 'DEBIT' ? 'PLATFORM_INTEREST' : `CUSTOMER_${customerId}`,
    debitAccount: type === 'DEBIT' ? `CUSTOMER_${customerId}` : 'PLATFORM_INTEREST',
    reference: `INT-${Date.now()}`,
  });
  res.json(txn);
});

module.exports = router;
