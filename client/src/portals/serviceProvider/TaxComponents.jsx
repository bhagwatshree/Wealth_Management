import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getTaxComponents, createTaxComponent, updateTaxComponent } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate, toFineractDate } from '../../utils/formatters';

const accountTypeOptions = [
  { value: 1, label: 'Asset' },
  { value: 2, label: 'Liability' },
  { value: 3, label: 'Equity' },
  { value: 4, label: 'Income' },
  { value: 5, label: 'Expense' },
];

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'percentage', label: 'Percentage', type: 'number', required: true },
  { name: 'debitAccountType', label: 'Debit Account Type', options: accountTypeOptions },
  { name: 'creditAccountType', label: 'Credit Account Type', options: accountTypeOptions },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
];

export default function TaxComponents() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getTaxComponents()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (values) => {
    const payload = { ...values, dateFormat: 'dd MMMM yyyy', locale: 'en', startDate: toFineractDate(values.startDate) };
    if (dialog.edit) await updateTaxComponent(dialog.edit.id, payload);
    else await createTaxComponent(payload);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'percentage', headerName: 'Percentage', width: 120 },
    { field: 'startDate', headerName: 'Start Date', width: 150, valueFormatter: (v) => formatDate(v) },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Tax Components</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Tax Component" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Tax Component' : 'Create Tax Component'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
