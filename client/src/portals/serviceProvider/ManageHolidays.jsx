import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getHolidays, createHoliday, updateHoliday, deleteHoliday, getOffices } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate, toFineractDate } from '../../utils/formatters';

export default function ManageHolidays() {
  const [rows, setRows] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    Promise.all([getHolidays(1), getOffices()])
      .then(([h, o]) => { setRows(h); setOffices(o); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'name', label: 'Holiday Name', required: true },
    { name: 'fromDate', label: 'From Date', type: 'date', required: true },
    { name: 'toDate', label: 'To Date', type: 'date', required: true },
    { name: 'description', label: 'Description', multiline: true },
    { name: 'officeId', label: 'Office', options: offices.map(o => ({ value: o.id, label: o.name })), required: true },
  ];

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      dateFormat: 'dd MMMM yyyy',
      locale: 'en',
      fromDate: toFineractDate(values.fromDate),
      toDate: toFineractDate(values.toDate),
    };
    if (dialog.edit) await updateHoliday(dialog.edit.id, payload);
    else await createHoliday(payload);
    load();
  };

  const handleDelete = async (id) => {
    try { await deleteHoliday(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'name', headerName: 'Holiday Name', flex: 1 },
    { field: 'fromDate', headerName: 'From Date', width: 150, valueFormatter: (v) => formatDate(v) },
    { field: 'toDate', headerName: 'To Date', width: 150, valueFormatter: (v) => formatDate(v) },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'status', headerName: 'Status', width: 120 },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Holidays</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Holiday" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Holiday' : 'Create Holiday'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
