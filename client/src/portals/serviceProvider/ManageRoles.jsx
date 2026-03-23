import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getRoles, createRole, updateRole, deleteRole } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'name', label: 'Role Name', required: true },
  { name: 'description', label: 'Description', multiline: true },
];

export default function ManageRoles() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getRoles()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateRole(dialog.edit.id, values);
    else await createRole(values);
    load();
  };

  const handleDelete = async (id) => {
    try { await deleteRole(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'disabled', headerName: 'Disabled', width: 100, valueGetter: (v, row) => row.disabled ? 'Yes' : 'No' },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Roles & Permissions</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Role" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Role' : 'Create Role'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
