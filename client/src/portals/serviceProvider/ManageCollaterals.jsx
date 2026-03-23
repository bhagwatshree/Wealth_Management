import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getCollaterals, createCollateral, updateCollateral, deleteCollateral } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'quality', label: 'Quality', required: true, options: [{ value: 'Very Good', label: 'Very Good' }, { value: 'Good', label: 'Good' }, { value: 'Average', label: 'Average' }, { value: 'Poor', label: 'Poor' }] },
  { name: 'basePrice', label: 'Base Price', type: 'number', required: true },
  { name: 'pctToBase', label: '% to Base', type: 'number', required: true },
  { name: 'unitType', label: 'Unit Type' },
  { name: 'currency', label: 'Currency', defaultValue: 'USD' },
];

export default function ManageCollaterals() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getCollaterals()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateCollateral(dialog.edit.id, values);
    else await createCollateral(values);
    load();
  };

  const handleDelete = async (id) => {
    try { await deleteCollateral(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'quality', headerName: 'Quality', width: 120 },
    { field: 'basePrice', headerName: 'Base Price', width: 120 },
    { field: 'pctToBase', headerName: '% to Base', width: 110 },
    { field: 'unitType', headerName: 'Unit Type', width: 120 },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Collaterals</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Collateral" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Collateral' : 'Create Collateral'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
