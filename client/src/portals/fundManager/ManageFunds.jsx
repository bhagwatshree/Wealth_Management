import { useEffect, useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getFunds, createFund, updateFund } from '../../api/fundManagerApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';

const fields = [
  { name: 'name', label: 'Fund Name', required: true },
  { name: 'externalId', label: 'External ID' },
];

export default function ManageFunds() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getFunds);
  const [dialog, setDialog] = useState({ open: false, edit: null });

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateFund(dialog.edit.id, values);
    else await createFund(values);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Fund Name', flex: 1 },
    { field: 'externalId', headerName: 'External ID', flex: 1 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Funds</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Fund" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Fund' : 'Create Fund'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
