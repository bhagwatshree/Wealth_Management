const { v4: uuidv4 } = require('uuid');
const eventBus = require('../../events/eventBus');

// In-memory ledger
const transactions = [];

const TXN_TYPES = {
  PAYMENT: 'PAYMENT',
  DEPOSIT: 'DEPOSIT',
  WITHDRAWAL: 'WITHDRAWAL',
  INTEREST_CREDIT: 'INTEREST_CREDIT',
  INTEREST_DEBIT: 'INTEREST_DEBIT',
  FEE: 'FEE',
  REFUND: 'REFUND',
  TRANSFER: 'TRANSFER',
};

const TXN_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  PENDING: 'PENDING',
};

function createTransaction({
  customerId,
  customerName,
  applicationId,
  accountId,
  type,
  amount,
  currency = 'TZS',
  description,
  productName,
  debitAccount,
  creditAccount,
  reference,
}) {
  const txn = {
    id: uuidv4(),
    customerId,
    customerName: customerName || customerId,
    applicationId: applicationId || null,
    accountId: accountId || null,
    type,
    amount: Number(amount),
    currency,
    description: description || '',
    productName: productName || '',
    debitAccount: debitAccount || null,
    creditAccount: creditAccount || null,
    reference: reference || `TXN-${Date.now()}`,
    status: TXN_STATUS.SUCCESS,
    createdAt: new Date().toISOString(),
    balanceAfter: null,
  };

  // Calculate running balance for this customer+account
  const prev = getAccountBalance(customerId, accountId);
  if (type === TXN_TYPES.DEPOSIT || type === TXN_TYPES.PAYMENT || type === TXN_TYPES.INTEREST_CREDIT || type === TXN_TYPES.REFUND) {
    txn.balanceAfter = prev + txn.amount;
  } else {
    txn.balanceAfter = prev - txn.amount;
  }

  transactions.push(txn);

  eventBus.publish('TRANSACTION_CREATED', {
    transactionId: txn.id,
    customerId,
    type,
    amount: txn.amount,
    accountId,
  });

  return txn;
}

function getAccountBalance(customerId, accountId) {
  let balance = 0;
  transactions
    .filter((t) => t.customerId === customerId && (accountId ? t.accountId === accountId : true) && t.status === TXN_STATUS.SUCCESS)
    .forEach((t) => {
      if ([TXN_TYPES.DEPOSIT, TXN_TYPES.PAYMENT, TXN_TYPES.INTEREST_CREDIT, TXN_TYPES.REFUND].includes(t.type)) {
        balance += t.amount;
      } else {
        balance -= t.amount;
      }
    });
  return balance;
}

function getTransactionsByCustomer(customerId, { type, accountId, limit = 100, offset = 0 } = {}) {
  let result = transactions.filter((t) => t.customerId === customerId);
  if (type) result = result.filter((t) => t.type === type);
  if (accountId) result = result.filter((t) => t.accountId === accountId);
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return {
    total: result.length,
    transactions: result.slice(offset, offset + limit),
  };
}

function getTransactionsByApplication(applicationId) {
  return transactions
    .filter((t) => t.applicationId === applicationId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

function getAllTransactions({ customerId, type, status, dateFrom, dateTo, limit = 200, offset = 0 } = {}) {
  let result = [...transactions];
  if (customerId) result = result.filter((t) => t.customerId === customerId);
  if (type) result = result.filter((t) => t.type === type);
  if (status) result = result.filter((t) => t.status === status);
  if (dateFrom) result = result.filter((t) => new Date(t.createdAt) >= new Date(dateFrom));
  if (dateTo) result = result.filter((t) => new Date(t.createdAt) <= new Date(dateTo));
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return {
    total: result.length,
    transactions: result.slice(offset, offset + limit),
  };
}

function getLedgerSummary() {
  const totalCredits = transactions
    .filter((t) => [TXN_TYPES.DEPOSIT, TXN_TYPES.PAYMENT, TXN_TYPES.INTEREST_CREDIT, TXN_TYPES.REFUND].includes(t.type) && t.status === TXN_STATUS.SUCCESS)
    .reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = transactions
    .filter((t) => [TXN_TYPES.WITHDRAWAL, TXN_TYPES.INTEREST_DEBIT, TXN_TYPES.FEE].includes(t.type) && t.status === TXN_STATUS.SUCCESS)
    .reduce((sum, t) => sum + t.amount, 0);

  const byType = {};
  transactions.forEach((t) => {
    if (!byType[t.type]) byType[t.type] = { count: 0, total: 0 };
    byType[t.type].count++;
    byType[t.type].total += t.amount;
  });

  return {
    totalTransactions: transactions.length,
    totalCredits,
    totalDebits,
    netBalance: totalCredits - totalDebits,
    byType,
  };
}

function getTransaction(id) {
  return transactions.find((t) => t.id === id) || null;
}

module.exports = {
  createTransaction,
  getAccountBalance,
  getTransactionsByCustomer,
  getTransactionsByApplication,
  getAllTransactions,
  getLedgerSummary,
  getTransaction,
  TXN_TYPES,
  TXN_STATUS,
};
