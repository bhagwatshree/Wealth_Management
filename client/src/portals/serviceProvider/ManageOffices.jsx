import { useEffect, useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getOffices, createOffice, updateOffice } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { toFineractDate } from '../../utils/formatters';

export default function ManageOffices() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getOffices);
  const [dialog, setDialog] = useState({ open: false, edit: null });

  useEffect(() => { load(); }, [load]);

  const fields = [
    { name: 'name', label: 'Office Name', required: true },
    { name: 'parentId', label: 'Parent Office', options: rows.map(r => ({ value: r.id, label: r.name })) },
    { name: 'openingDate', label: 'Opening Date', type: 'date', required: true },
    { name: 'externalId', label: 'External ID' },
  ];

  const handleSubmit = async (values) => {
    const payload = { ...values, dateFormat: 'dd MMMM yyyy', locale: 'en', openingDate: toFineractDate(values.openingDate) };
    if (dialog.edit) await updateOffice(dialog.edit.id, payload);
    else await createOffice(payload);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Office Name', flex: 1 },
    { field: 'nameDecorated', headerName: 'Hierarchy', flex: 1 },
    { field: 'externalId', headerName: 'External ID', width: 150 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Offices</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Office" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Office' : 'Create Office'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
