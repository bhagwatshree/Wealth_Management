import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getClients, createClient, updateClient, deleteClient, getOffices } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { toFineractDate } from '../../utils/formatters';

export default function ManageClients() {
  const [rows, setRows] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [pageError, setPageError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    Promise.all([getClients(), getOffices()])
      .then(([c, o]) => { setRows(c.pageItems || c); setOffices(o); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'officeId', label: 'Office', options: offices.map(o => ({ value: o.id, label: o.name })), required: true },
    { name: 'legalFormId', label: 'Legal Form', options: [{ value: 1, label: 'Person' }, { value: 2, label: 'Entity' }], required: true, defaultValue: 1 },
    { name: 'firstname', label: 'First Name', required: true },
    { name: 'lastname', label: 'Last Name', required: true },
    { name: 'mobileNo', label: 'Mobile Number' },
    { name: 'externalId', label: 'External ID' },
    { name: 'activationDate', label: 'Activation Date', type: 'date' },
    { name: 'active', label: 'Active', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }], defaultValue: true },
  ];

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
      activationDate: values.activationDate ? toFineractDate(values.activationDate) : toFineractDate(new Date()),
    };
    if (dialog.edit) await updateClient(dialog.edit.id, payload);
    else await createClient(payload);
    load();
  };

  const handleDelete = async () => {
    try {
      await deleteClient(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      load();
    } catch (e) {
      setDeleteDialog({ open: false, id: null });
      setDeleteError(parseApiError(e));
    }
  };

  const columns = [
    { field: 'accountNo', headerName: 'Account No', width: 130 },
    { field: 'displayName', headerName: 'Name', flex: 1 },
    { field: 'officeName', headerName: 'Office', flex: 1 },
    { field: 'status', headerName: 'Status', width: 100, valueGetter: (v, row) => row.status?.value || '' },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: params.row.id }); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Clients</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      {deleteError && <ErrorAlert error={deleteError} onClose={() => setDeleteError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Client" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Client' : 'Create Client'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
      <ConfirmDialog open={deleteDialog.open} title="Delete Client" message="Are you sure?" onConfirm={handleDelete} onCancel={() => setDeleteDialog({ open: false, id: null })} />
    </Box>
  );
}
