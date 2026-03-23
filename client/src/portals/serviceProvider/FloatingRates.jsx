import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getFloatingRates, createFloatingRate, updateFloatingRate } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'isBaseLendingRate', label: 'Base Lending Rate', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }] },
  { name: 'isActive', label: 'Active', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }], defaultValue: true },
];

export default function FloatingRates() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getFloatingRates()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateFloatingRate(dialog.edit.id, values);
    else await createFloatingRate(values);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'isBaseLendingRate', headerName: 'Base Lending Rate', width: 160, valueGetter: (v, row) => row.isBaseLendingRate ? 'Yes' : 'No' },
    { field: 'isActive', headerName: 'Active', width: 100, valueGetter: (v, row) => row.isActive ? 'Yes' : 'No' },
    { field: 'createdBy', headerName: 'Created By', width: 150 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Floating Rates</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Floating Rate" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Floating Rate' : 'Create Floating Rate'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
