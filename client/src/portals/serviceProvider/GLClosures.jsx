import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { getGLClosures, createGLClosure, getOffices } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate, toFineractDate } from '../../utils/formatters';

export default function GLClosures() {
  const [rows, setRows] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState(false);
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    Promise.all([getGLClosures(), getOffices()])
      .then(([c, o]) => { setRows(c); setOffices(o); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'officeId', label: 'Office', options: offices.map(o => ({ value: o.id, label: o.name })), required: true },
    { name: 'closingDate', label: 'Closing Date', type: 'date', required: true },
    { name: 'comments', label: 'Comments', multiline: true },
  ];

  const handleSubmit = async (values) => {
    await createGLClosure({ ...values, dateFormat: 'dd MMMM yyyy', locale: 'en', closingDate: toFineractDate(values.closingDate) });
    load();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'officeName', headerName: 'Office', flex: 1 },
    { field: 'closingDate', headerName: 'Closing Date', width: 150, valueFormatter: (v) => formatDate(v) },
    { field: 'comments', headerName: 'Comments', flex: 1 },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>GL Closures</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog(true)} addLabel="New Closure" />
      <FormDialog open={dialog} title="Create GL Closure" fields={fields} onSubmit={handleSubmit} onClose={() => setDialog(false)} />
    </Box>
  );
}
