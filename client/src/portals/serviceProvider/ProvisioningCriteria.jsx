import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getProvisioningCriteria, createProvisioningCriterion, updateProvisioningCriterion, deleteProvisioningCriterion } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'criteriaName', label: 'Criteria Name', required: true },
  { name: 'minAge', label: 'Min Age (days)', type: 'number' },
  { name: 'maxAge', label: 'Max Age (days)', type: 'number' },
  { name: 'provisioningPercentage', label: 'Provisioning Percentage', type: 'number' },
  { name: 'liabilityAccount', label: 'Liability Account', type: 'number' },
  { name: 'expenseAccount', label: 'Expense Account', type: 'number' },
];

export default function ProvisioningCriteria() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getProvisioningCriteria()
      .then(r => setRows(r))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateProvisioningCriterion(dialog.edit.id, values);
    else await createProvisioningCriterion(values);
    load();
  };

  const handleDelete = async (id) => {
    try { await deleteProvisioningCriterion(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'criteriaName', headerName: 'Criteria Name', flex: 1 },
    { field: 'createdBy', headerName: 'Created By', flex: 1, valueGetter: (v, row) => row.createdBy || '' },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Provisioning Criteria</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Criterion" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Criterion' : 'Create Provisioning Criterion'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
