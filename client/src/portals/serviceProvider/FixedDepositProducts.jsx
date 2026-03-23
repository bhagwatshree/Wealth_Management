import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getFixedDepositProducts, createFixedDepositProduct, updateFixedDepositProduct } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'shortName', label: 'Short Name', required: true },
  { name: 'description', label: 'Description', multiline: true },
  { name: 'currencyCode', label: 'Currency Code', defaultValue: 'USD' },
  { name: 'nominalAnnualInterestRate', label: 'Nominal Annual Interest Rate', type: 'number', required: true },
  { name: 'interestCompoundingPeriodType', label: 'Interest Compounding Period', required: true, options: [{ value: 1, label: 'Daily' }, { value: 4, label: 'Monthly' }, { value: 7, label: 'Annually' }] },
  { name: 'interestPostingPeriodType', label: 'Interest Posting Period', required: true, options: [{ value: 4, label: 'Monthly' }, { value: 7, label: 'Annually' }] },
  { name: 'interestCalculationType', label: 'Interest Calculation Type', required: true, options: [{ value: 1, label: 'Daily Balance' }, { value: 2, label: 'Average Daily Balance' }] },
  { name: 'interestCalculationDaysInYearType', label: 'Days in Year', required: true, options: [{ value: 360, label: '360 Days' }, { value: 365, label: '365 Days' }] },
  { name: 'minDepositTerm', label: 'Min Deposit Term', type: 'number', required: true },
  { name: 'minDepositTermTypeId', label: 'Min Deposit Term Type', required: true, options: [{ value: 0, label: 'Days' }, { value: 1, label: 'Weeks' }, { value: 2, label: 'Months' }, { value: 3, label: 'Years' }] },
];

export default function FixedDepositProducts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getFixedDepositProducts()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (values) => {
    const payload = { ...values, locale: 'en', dateFormat: 'dd MMMM yyyy', accountingRule: 1 };
    if (dialog.edit) await updateFixedDepositProduct(dialog.edit.id, payload);
    else await createFixedDepositProduct(payload);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'shortName', headerName: 'Short Name', width: 120 },
    { field: 'nominalAnnualInterestRate', headerName: 'Interest Rate %', width: 150 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Fixed Deposit Products</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Fixed Deposit Product" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Fixed Deposit Product' : 'Create Fixed Deposit Product'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
