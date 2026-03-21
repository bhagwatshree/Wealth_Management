import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { getAccountingRules, createAccountingRule, getOffices, getGLAccounts } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

export default function AccountingRules() {
  const [rows, setRows] = useState([]);
  const [offices, setOffices] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
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
    await createAccountingRule(values);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Rule Name', flex: 1 },
    { field: 'officeName', headerName: 'Office', flex: 1 },
    { field: 'debitAccountName', headerName: 'Debit Account', flex: 1, valueGetter: (v, row) => row.debitAccounts?.[0]?.name || '' },
    { field: 'creditAccountName', headerName: 'Credit Account', flex: 1, valueGetter: (v, row) => row.creditAccounts?.[0]?.name || '' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Accounting Rules</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog(true)} addLabel="New Rule" />
      <FormDialog open={dialog} title="Create Accounting Rule" fields={fields} onSubmit={handleSubmit} onClose={() => setDialog(false)} />
    </Box>
  );
}
