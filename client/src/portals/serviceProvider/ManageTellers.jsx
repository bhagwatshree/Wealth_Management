import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getTellers, createTeller, updateTeller, getOffices } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate, toFineractDate } from '../../utils/formatters';

export default function ManageTellers() {
  const [rows, setRows] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    Promise.all([getTellers(), getOffices()])
      .then(([t, o]) => { setRows(t); setOffices(o); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'officeId', label: 'Office', options: offices.map(o => ({ value: o.id, label: o.name })), required: true },
    { name: 'name', label: 'Teller Name', required: true },
    { name: 'description', label: 'Description', multiline: true },
    { name: 'startDate', label: 'Start Date', type: 'date', required: true },
    { name: 'endDate', label: 'End Date', type: 'date' },
    {
      name: 'status',
      label: 'Status',
      required: true,
      options: [
        { value: 300, label: 'Active' },
        { value: 400, label: 'Inactive' },
      ],
    },
  ];

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
      startDate: toFineractDate(values.startDate),
      endDate: values.endDate ? toFineractDate(values.endDate) : undefined,
    };
    if (dialog.edit) await updateTeller(dialog.edit.id, payload);
    else await createTeller(payload);
    load();
  };

  const statusLabels = { 300: 'Active', 400: 'Inactive' };

  const columns = [
    { field: 'name', headerName: 'Teller Name', flex: 1 },
    { field: 'officeName', headerName: 'Office', flex: 1 },
    { field: 'startDate', headerName: 'Start Date', width: 150, valueFormatter: (v) => formatDate(v) },
    { field: 'status', headerName: 'Status', width: 120, valueFormatter: (v) => statusLabels[v] || v },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Tellers</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Teller" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Teller' : 'Create Teller'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
