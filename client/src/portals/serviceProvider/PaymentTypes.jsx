import { useEffect, useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getPaymentTypes, createPaymentType, updatePaymentType } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';

const fields = [
  { name: 'name', label: 'Payment Type Name', required: true },
  { name: 'description', label: 'Description' },
  { name: 'isCashPayment', label: 'Cash Payment', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }], defaultValue: false },
  { name: 'position', label: 'Position', type: 'number', defaultValue: '1' },
];

export default function PaymentTypes() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getPaymentTypes);
  const [dialog, setDialog] = useState({ open: false, edit: null });

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    if (dialog.edit) await updatePaymentType(dialog.edit.id, values);
    else await createPaymentType(values);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'description', headerName: 'Description', flex: 1 },
    { field: 'isCashPayment', headerName: 'Cash', width: 80, valueGetter: (v, row) => row.isCashPayment ? 'Yes' : 'No' },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Payment Types</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Payment Type" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Payment Type' : 'Create Payment Type'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
