import { useEffect, useState } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getCharges, createCharge, updateCharge, deleteCharge } from '../../api/fundManagerApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';
import { CHARGE_APPLIES_TO, CHARGE_TIME_TYPE, CHARGE_CALCULATION_TYPE } from '../../utils/constants';

const fields = [
  { name: 'name', label: 'Charge Name', required: true },
  { name: 'chargeAppliesTo', label: 'Applies To', options: CHARGE_APPLIES_TO, required: true, defaultValue: 1 },
  { name: 'currencyCode', label: 'Currency', required: true, defaultValue: 'USD' },
  { name: 'amount', label: 'Amount', type: 'number', required: true },
  { name: 'chargeTimeType', label: 'Time Type', options: CHARGE_TIME_TYPE, required: true, defaultValue: 1 },
  { name: 'chargeCalculationType', label: 'Calculation Type', options: CHARGE_CALCULATION_TYPE, required: true, defaultValue: 1 },
  { name: 'chargePaymentMode', label: 'Payment Mode', options: [{ value: 0, label: 'Regular' }, { value: 1, label: 'Account Transfer' }], defaultValue: 0 },
  { name: 'active', label: 'Active', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }], defaultValue: true },
];

export default function ManageCharges() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getCharges);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, id: null });
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    const payload = { ...values, locale: 'en' };
    if (dialog.edit) await updateCharge(dialog.edit.id, payload);
    else await createCharge(payload);
    load();
  };

  const handleDelete = async () => {
    try {
      await deleteCharge(deleteDialog.id);
      setDeleteDialog({ open: false, id: null });
      load();
    } catch (e) {
      setDeleteDialog({ open: false, id: null });
      setDeleteError(parseApiError(e));
    }
  };

  const columns = [
    { field: 'name', headerName: 'Charge Name', flex: 1 },
    { field: 'amount', headerName: 'Amount', width: 120 },
    { field: 'currency', headerName: 'Currency', width: 100, valueGetter: (v, row) => row.currency?.code || '' },
    { field: 'active', headerName: 'Active', width: 80, valueGetter: (v, row) => row.active ? 'Yes' : 'No' },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, id: params.row.id }); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Charges</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      {deleteError && <ErrorAlert error={deleteError} onClose={() => setDeleteError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Charge" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Charge' : 'Create Charge'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
      <ConfirmDialog open={deleteDialog.open} title="Delete Charge" message="Are you sure you want to delete this charge?" onConfirm={handleDelete} onCancel={() => setDeleteDialog({ open: false, id: null })} />
    </Box>
  );
}
