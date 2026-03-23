import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getConfigurations, updateConfiguration } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'enabled', label: 'Enabled', options: [{ value: true, label: 'Enabled' }, { value: false, label: 'Disabled' }] },
  { name: 'value', label: 'Value', type: 'number' },
];

export default function GlobalConfigurations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getConfigurations()
      .then(data => setRows(data.globalConfiguration || data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (values) => {
    await updateConfiguration(dialog.edit.id, values);
    load();
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'enabled', headerName: 'Enabled', width: 100, valueGetter: (v, row) => row.enabled ? 'Yes' : 'No' },
    { field: 'value', headerName: 'Value', width: 120 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Global Configurations</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} />
      <FormDialog open={dialog.open} title="Edit Configuration" fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
