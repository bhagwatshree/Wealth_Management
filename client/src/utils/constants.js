export const CHARGE_APPLIES_TO = [
  { value: 1, label: 'Loan' },
  { value: 2, label: 'Savings' },
  { value: 3, label: 'Client' },
];

export const CHARGE_TIME_TYPE = [
  { value: 1, label: 'Disbursement' },
  { value: 2, label: 'Specified Due Date' },
  { value: 8, label: 'Installment Fee' },
  { value: 9, label: 'Overdue Fees' },
];

export const CHARGE_CALCULATION_TYPE = [
  { value: 1, label: 'Flat' },
  { value: 2, label: '% Amount' },
  { value: 3, label: '% Amount + Interest' },
  { value: 4, label: '% Interest' },
];

export const GL_ACCOUNT_TYPE = [
  { value: 1, label: 'Asset' },
  { value: 2, label: 'Liability' },
  { value: 3, label: 'Equity' },
  { value: 4, label: 'Income' },
  { value: 5, label: 'Expense' },
];

export const GL_ACCOUNT_USAGE = [
  { value: 1, label: 'Header' },
  { value: 2, label: 'Detail' },
];

export const INTEREST_COMPOUNDING = [
  { value: 1, label: 'Daily' },
  { value: 4, label: 'Monthly' },
  { value: 6, label: 'Quarterly' },
  { value: 7, label: 'Semi-Annual' },
  { value: 8, label: 'Annual' },
];

export const INTEREST_POSTING_PERIOD = [
  { value: 4, label: 'Monthly' },
  { value: 5, label: 'Quarterly' },
  { value: 6, label: 'Bi-Annual' },
  { value: 7, label: 'Annual' },
];

export const INTEREST_CALC_TYPE = [
  { value: 1, label: 'Daily Balance' },
  { value: 2, label: 'Average Daily Balance' },
];

export const DAYS_IN_YEAR = [
  { value: 360, label: '360 Days' },
  { value: 365, label: '365 Days' },
];
