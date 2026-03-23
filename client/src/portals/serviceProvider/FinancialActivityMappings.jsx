import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getFinancialActivityMappings, createFinancialActivityMapping, updateFinancialActivityMapping, deleteFinancialActivityMapping, getGLAccounts } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const financialActivityOptions = [
  { value: 100, label: 'Asset Transfer' },
  { value: 200, label: 'Liability Transfer' },
  { value: 101, label: 'Cash at ATM' },
  { value: 102, label: 'Cash at Tellers' },
  { value: 103, label: 'Opening Balances Transfer/Contra' },
  { value: 201, label: 'Fund Source' },
  { value: 202, label: 'Over Payment Liability' },
];

export default function FinancialActivityMappings() {
  const [rows, setRows] = useState([]);
  const [glAccounts, setGlAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    Promise.all([getFinancialActivityMappings(), getGLAccounts()])
      .then(([m, g]) => { setRows(m); setGlAccounts(g); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const fields = [
    { name: 'financialActivityId', label: 'Financial Activity', options: financialActivityOptions, required: true },
    { name: 'glAccountId', label: 'GL Account', options: glAccounts.map(a => ({ value: a.id, label: `${a.glCode} - ${a.name}` })), required: true },
  ];

  const handleSubmit = async (values) => {
    if (dialog.edit) await updateFinancialActivityMapping(dialog.edit.id, values);
    else await createFinancialActivityMapping(values);
    load();
  };

  const handleDelete = async (id) => {
    try { await deleteFinancialActivityMapping(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'financialActivityName', headerName: 'Financial Activity', flex: 1, valueGetter: (v, row) => row.financialActivityData?.name || '' },
    { field: 'glAccountName', headerName: 'GL Account', flex: 1, valueGetter: (v, row) => row.glAccountData?.name || '' },
    { field: 'glAccountCode', headerName: 'GL Code', width: 150, valueGetter: (v, row) => row.glAccountData?.glCode || '' },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}><EditIcon fontSize="small" /></IconButton>
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}><DeleteIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Financial Activity Mappings</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Mapping" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Mapping' : 'Create Financial Activity Mapping'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
