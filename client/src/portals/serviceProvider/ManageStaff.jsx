import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getStaff, createStaff, updateStaff, getOffices } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

export default function ManageStaff() {
  const [rows, setRows] = useState([]);
  const [offices, setOffices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    Promise.all([getStaff(), getOffices()])
      .then(([s, o]) => { setRows(s); setOffices(o); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'officeId', label: 'Office', options: offices.map(o => ({ value: o.id, label: o.name })), required: true },
    { name: 'firstname', label: 'First Name', required: true },
    { name: 'lastname', label: 'Last Name', required: true },
    { name: 'mobileNo', label: 'Mobile Number' },
    { name: 'isLoanOfficer', label: 'Loan Officer', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }], defaultValue: false },
    { name: 'isActive', label: 'Active', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }], defaultValue: true },
  ];

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateStaff(dialog.edit.id, values);
    else await createStaff(values);
    load();
  };

  const columns = [
    { field: 'displayName', headerName: 'Name', flex: 1 },
    { field: 'officeName', headerName: 'Office', flex: 1 },
    { field: 'mobileNo', headerName: 'Mobile', width: 140 },
    { field: 'isLoanOfficer', headerName: 'Loan Officer', width: 120, valueGetter: (v, row) => row.isLoanOfficer ? 'Yes' : 'No' },
    { field: 'isActive', headerName: 'Active', width: 80, valueGetter: (v, row) => row.isActive ? 'Yes' : 'No' },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Staff</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Staff" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Staff' : 'Create Staff'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
