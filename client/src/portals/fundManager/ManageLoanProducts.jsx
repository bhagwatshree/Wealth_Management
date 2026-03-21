import { useEffect } from 'react';
import { useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getLoanProducts, createLoanProduct, updateLoanProduct } from '../../api/fundManagerApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { formatCurrency } from '../../utils/formatters';

const fields = [
  { name: 'name', label: 'Product Name', required: true },
  { name: 'shortName', label: 'Short Name', required: true },
  { name: 'currencyCode', label: 'Currency Code', required: true, defaultValue: 'USD' },
  { name: 'digitsAfterDecimal', label: 'Decimal Places', type: 'number', defaultValue: '2' },
  { name: 'principal', label: 'Default Principal', type: 'number', required: true },
  { name: 'minPrincipal', label: 'Min Principal', type: 'number' },
  { name: 'maxPrincipal', label: 'Max Principal', type: 'number' },
  { name: 'numberOfRepayments', label: 'Number of Repayments', type: 'number', required: true },
  { name: 'repaymentEvery', label: 'Repay Every', type: 'number', defaultValue: '1' },
  { name: 'interestRatePerPeriod', label: 'Interest Rate Per Period', type: 'number', required: true },
  { name: 'repaymentFrequencyType', label: 'Repayment Frequency', options: [{ value: 0, label: 'Days' }, { value: 1, label: 'Weeks' }, { value: 2, label: 'Months' }], defaultValue: 2 },
  { name: 'interestRateFrequencyType', label: 'Interest Rate Frequency', options: [{ value: 2, label: 'Per Month' }, { value: 3, label: 'Per Year' }], defaultValue: 2 },
  { name: 'amortizationType', label: 'Amortization', options: [{ value: 0, label: 'Equal Principal' }, { value: 1, label: 'Equal Installments' }], defaultValue: 1 },
  { name: 'interestType', label: 'Interest Type', options: [{ value: 0, label: 'Declining Balance' }, { value: 1, label: 'Flat' }], defaultValue: 0 },
  { name: 'interestCalculationPeriodType', label: 'Interest Calc Period', options: [{ value: 0, label: 'Daily' }, { value: 1, label: 'Same as Repayment' }], defaultValue: 1 },
  { name: 'daysInYearType', label: 'Days in Year', options: [{ value: 1, label: 'Actual' }, { value: 360, label: '360 Days' }, { value: 364, label: '364 Days' }, { value: 365, label: '365 Days' }], defaultValue: 365, required: true },
  { name: 'daysInMonthType', label: 'Days in Month', options: [{ value: 1, label: 'Actual' }, { value: 30, label: '30 Days' }], defaultValue: 1, required: true },
  { name: 'isInterestRecalculationEnabled', label: 'Interest Recalculation', options: [{ value: false, label: 'Disabled' }, { value: true, label: 'Enabled' }], defaultValue: false, required: true },
  { name: 'transactionProcessingStrategyCode', label: 'Repayment Strategy', defaultValue: 'mifos-standard-strategy' },
  { name: 'accountingRule', label: 'Accounting', options: [{ value: 1, label: 'None' }, { value: 2, label: 'Cash' }, { value: 3, label: 'Accrual Periodic' }, { value: 4, label: 'Accrual Upfront' }], defaultValue: 1 },
];

export default function ManageLoanProducts() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getLoanProducts);
  const [dialog, setDialog] = useState({ open: false, edit: null });

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    const payload = { ...values, locale: 'en', dateFormat: 'dd MMMM yyyy', inMultiplesOf: 0 };
    if (dialog.edit) await updateLoanProduct(dialog.edit.id, payload);
    else await createLoanProduct(payload);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Product Name', flex: 1 },
    { field: 'shortName', headerName: 'Short Name', width: 120 },
    { field: 'interestRatePerPeriod', headerName: 'Interest %', width: 110 },
    { field: 'principal', headerName: 'Principal', width: 130, valueFormatter: (v) => formatCurrency(v) },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Loan Products</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Loan Product" />
      <FormDialog
        open={dialog.open}
        title={dialog.edit ? 'Edit Loan Product' : 'Create Loan Product'}
        fields={fields}
        initialValues={dialog.edit}
        onSubmit={handleSubmit}
        onClose={() => setDialog({ open: false, edit: null })}
      />
    </Box>
  );
}
