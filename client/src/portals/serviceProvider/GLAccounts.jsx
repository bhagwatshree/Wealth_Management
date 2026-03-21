import { useEffect, useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getGLAccounts, createGLAccount, updateGLAccount } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { GL_ACCOUNT_TYPE, GL_ACCOUNT_USAGE } from '../../utils/constants';

const fields = [
  { name: 'name', label: 'Account Name', required: true },
  { name: 'glCode', label: 'GL Code', required: true },
  { name: 'type', label: 'Account Type', options: GL_ACCOUNT_TYPE, required: true },
  { name: 'usage', label: 'Usage', options: GL_ACCOUNT_USAGE, required: true, defaultValue: 2 },
  { name: 'manualEntriesAllowed', label: 'Manual Entries', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }], defaultValue: true },
  { name: 'description', label: 'Description', multiline: true },
];

export default function GLAccounts() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getGLAccounts);
  const [dialog, setDialog] = useState({ open: false, edit: null });

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateGLAccount(dialog.edit.id, values);
    else await createGLAccount(values);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Account Name', flex: 1 },
    { field: 'glCode', headerName: 'GL Code', width: 120 },
    { field: 'type', headerName: 'Type', width: 120, valueGetter: (v, row) => row.type?.value || '' },
    { field: 'usage', headerName: 'Usage', width: 100, valueGetter: (v, row) => row.usage?.value || '' },
    { field: 'manualEntriesAllowed', headerName: 'Manual', width: 80, valueGetter: (v, row) => row.manualEntriesAllowed ? 'Yes' : 'No' },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>GL Accounts (Chart of Accounts)</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New GL Account" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit GL Account' : 'Create GL Account'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
