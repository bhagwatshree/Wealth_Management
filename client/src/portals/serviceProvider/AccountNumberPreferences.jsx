import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAccountNumberPreferences, createAccountNumberPreference, updateAccountNumberPreference, deleteAccountNumberPreference } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'accountType', label: 'Account Type', required: true, options: [
    { value: 1, label: 'Client' },
    { value: 2, label: 'Loan' },
    { value: 3, label: 'Savings' },
  ]},
  { name: 'prefixType', label: 'Prefix Type', required: true, options: [
    { value: 1, label: 'Office Name' },
    { value: 2, label: 'Staff Name' },
    { value: 101, label: 'Custom Prefix' },
  ]},
];

export default function AccountNumberPreferences() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getAccountNumberPreferences()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateAccountNumberPreference(dialog.edit.id, values);
    else await createAccountNumberPreference(values);
    load();
  };

  const handleDelete = async (id) => {
    try { await deleteAccountNumberPreference(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'accountType', headerName: 'Account Type', flex: 1, valueGetter: (v, row) => row.accountType?.value || '' },
    { field: 'prefixType', headerName: 'Prefix Type', flex: 1, valueGetter: (v, row) => row.prefixType?.value || '' },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Account Number Preferences</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Preference" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Preference' : 'Create Preference'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
