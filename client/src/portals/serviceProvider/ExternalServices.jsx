import { useState, useEffect } from 'react';
import { Typography, Box, IconButton, Alert } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getExternalServices, updateExternalService } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'value', label: 'Value', multiline: true },
];

export default function ExternalServices() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getExternalServices()
      .then(data => setRows(data.map((r, i) => ({ id: r.id || i, ...r }))))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (values) => {
    await updateExternalService(dialog.edit.name, values);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>External Services</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>Configure external service integrations like S3, Email, SMS, and notification services.</Alert>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} />
      <FormDialog open={dialog.open} title="Edit External Service" fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
