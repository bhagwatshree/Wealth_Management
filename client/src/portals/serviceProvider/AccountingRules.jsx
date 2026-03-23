import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAccountingRules, createAccountingRule, updateAccountingRule, deleteAccountingRule, getOffices, getGLAccounts } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

export default function AccountingRules() {
  const [rows, setRows] = useState([]);
  const [offices, setOffices] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    Promise.all([getAccountingRules(), getOffices(), getGLAccounts()])
      .then(([r, o, g]) => { setRows(r); setOffices(o); setGlAccounts(g.filter(a => a.usage?.id === 2)); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'name', label: 'Rule Name', required: true },
    { name: 'officeId', label: 'Office', options: offices.map(o => ({ value: o.id, label: o.name })), required: true },
    { name: 'accountToDebit', label: 'Debit Account', options: glAccounts.map(a => ({ value: a.id, label: `${a.glCode} - ${a.name}` })), required: true },
    { name: 'accountToCredit', label: 'Credit Account', options: glAccounts.map(a => ({ value: a.id, label: `${a.glCode} - ${a.name}` })), required: true },
    { name: 'description', label: 'Description', multiline: true },
  ];

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateAccountingRule(dialog.edit.id, values);
    else await createAccountingRule(values);
    load();
  };

  const handleDelete = async (id) => {
    try { await deleteAccountingRule(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'name', headerName: 'Rule Name', flex: 1 },
    { field: 'officeName', headerName: 'Office', flex: 1 },
    { field: 'debitAccountName', headerName: 'Debit Account', flex: 1, valueGetter: (v, row) => row.debitAccounts?.[0]?.name || '' },
    { field: 'creditAccountName', headerName: 'Credit Account', flex: 1, valueGetter: (v, row) => row.creditAccounts?.[0]?.name || '' },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Accounting Rules</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Rule" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Rule' : 'Create Accounting Rule'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
