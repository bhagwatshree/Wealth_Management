import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { getProvisioningEntries, createProvisioningEntry } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate, toFineractDate } from '../../utils/formatters';

export default function ProvisioningEntries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getProvisioningEntries()
      .then(r => setRows(r))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'date', label: 'Date', type: 'date', required: true },
  ];

  const handleSubmit = async (values) => {
    await createProvisioningEntry({ date: toFineractDate(values.date), dateFormat: 'dd MMMM yyyy', locale: 'en' });
    load();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'createdDate', headerName: 'Created Date', flex: 1, valueFormatter: (v) => formatDate(v) },
    { field: 'journalEntry', headerName: 'Journal Entry', width: 150, valueGetter: (v, row) => row.journalEntry ? 'Yes' : 'No' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Provisioning Entries</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="Create Provisioning Entry" />
      <FormDialog open={dialog.open} title="Create Provisioning Entry" fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
