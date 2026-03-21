import { useEffect, useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getSavingsProducts, createSavingsProduct, updateSavingsProduct } from '../../api/fundManagerApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { INTEREST_COMPOUNDING, INTEREST_POSTING_PERIOD, INTEREST_CALC_TYPE, DAYS_IN_YEAR } from '../../utils/constants';

const fields = [
  { name: 'name', label: 'Product Name', required: true },
  { name: 'shortName', label: 'Short Name', required: true },
  { name: 'description', label: 'Description', multiline: true },
  { name: 'currencyCode', label: 'Currency Code', required: true, defaultValue: 'USD' },
  { name: 'digitsAfterDecimal', label: 'Decimal Places', type: 'number', defaultValue: '2' },
  { name: 'nominalAnnualInterestRate', label: 'Annual Interest Rate %', type: 'number', required: true },
  { name: 'interestCompoundingPeriodType', label: 'Compounding Period', options: INTEREST_COMPOUNDING, defaultValue: 1 },
  { name: 'interestPostingPeriodType', label: 'Posting Period', options: INTEREST_POSTING_PERIOD, defaultValue: 4 },
  { name: 'interestCalculationType', label: 'Interest Calculation', options: INTEREST_CALC_TYPE, defaultValue: 1 },
  { name: 'interestCalculationDaysInYearType', label: 'Days in Year', options: DAYS_IN_YEAR, defaultValue: 365 },
  { name: 'accountingRule', label: 'Accounting', options: [{ value: 1, label: 'None' }, { value: 2, label: 'Cash' }], defaultValue: 1 },
];

export default function ManageSavingsProducts() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getSavingsProducts);
  const [dialog, setDialog] = useState({ open: false, edit: null });

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    const payload = { ...values, locale: 'en', inMultiplesOf: 0 };
    if (dialog.edit) await updateSavingsProduct(dialog.edit.id, payload);
    else await createSavingsProduct(payload);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Product Name', flex: 1 },
    { field: 'shortName', headerName: 'Short Name', width: 120 },
    { field: 'nominalAnnualInterestRate', headerName: 'Interest %', width: 120 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Savings Products</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Savings Product" />
      <FormDialog
        open={dialog.open}
        title={dialog.edit ? 'Edit Savings Product' : 'Create Savings Product'}
        fields={fields}
        initialValues={dialog.edit}
        onSubmit={handleSubmit}
        onClose={() => setDialog({ open: false, edit: null })}
      />
    </Box>
  );
}
