import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { getJournalEntries, createJournalEntry, getOffices, getGLAccounts } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate, formatCurrency, toFineractDate } from '../../utils/formatters';

export default function JournalEntries() {
  const [rows, setRows] = useState([]);
  const [offices, setOffices] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    Promise.all([getJournalEntries({ limit: 100 }), getOffices(), getGLAccounts()])
      .then(([data, o, g]) => { setRows(data.pageItems || data); setOffices(o); setGlAccounts(g); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'officeId', label: 'Office', options: offices.map(o => ({ value: o.id, label: o.name })), required: true },
    { name: 'transactionDate', label: 'Transaction Date', type: 'date', required: true },
    { name: 'debitGlAccountId', label: 'Debit Account', options: glAccounts.map(a => ({ value: a.id, label: `${a.glCode} - ${a.name}` })), required: true },
    { name: 'creditGlAccountId', label: 'Credit Account', options: glAccounts.map(a => ({ value: a.id, label: `${a.glCode} - ${a.name}` })), required: true },
    { name: 'amount', label: 'Amount', type: 'number', required: true },
    { name: 'comments', label: 'Comments', multiline: true },
    { name: 'referenceNumber', label: 'Reference Number' },
  ];

  const handleSubmit = async (values) => {
    const payload = {
      officeId: values.officeId,
      transactionDate: toFineractDate(values.transactionDate),
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
      currencyCode: 'USD',
      comments: values.comments || '',
      referenceNumber: values.referenceNumber || '',
      debits: [{ glAccountId: values.debitGlAccountId, amount: values.amount }],
      credits: [{ glAccountId: values.creditGlAccountId, amount: values.amount }],
    };
    await createJournalEntry(payload);
    load();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'officeName', headerName: 'Office', flex: 1 },
    { field: 'glAccountName', headerName: 'GL Account', flex: 1 },
    { field: 'glAccountCode', headerName: 'Code', width: 100 },
    { field: 'entryType', headerName: 'Type', width: 100, valueGetter: (v, row) => row.entryType?.value || '' },
    { field: 'amount', headerName: 'Amount', width: 130, valueFormatter: (v) => formatCurrency(v) },
    { field: 'transactionDate', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v) },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Journal Entries</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog(true)} addLabel="New Entry" />
      <FormDialog open={dialog} title="Create Journal Entry" fields={fields} onSubmit={handleSubmit} onClose={() => setDialog(false)} />
    </Box>
  );
}
