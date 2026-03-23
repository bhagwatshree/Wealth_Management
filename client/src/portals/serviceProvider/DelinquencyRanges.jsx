import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDelinquencyRanges, createDelinquencyRange, updateDelinquencyRange, deleteDelinquencyRange } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'classification', label: 'Classification', required: true },
  { name: 'minimumAgeDays', label: 'Minimum Age (Days)', type: 'number', required: true },
  { name: 'maximumAgeDays', label: 'Maximum Age (Days)', type: 'number', required: true },
];

export default function DelinquencyRanges() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getDelinquencyRanges()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateDelinquencyRange(dialog.edit.id, values);
    else await createDelinquencyRange(values);
    load();
  };

  const handleDelete = async (id) => {
    try { await deleteDelinquencyRange(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'classification', headerName: 'Classification', flex: 1 },
    { field: 'minimumAgeDays', headerName: 'Minimum Age (Days)', width: 170 },
    { field: 'maximumAgeDays', headerName: 'Maximum Age (Days)', width: 170 },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Delinquency Ranges</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Delinquency Range" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Delinquency Range' : 'Create Delinquency Range'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
