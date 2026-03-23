import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getShareProducts, createShareProduct, updateShareProduct } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'name', label: 'Name', required: true },
  { name: 'shortName', label: 'Short Name', required: true },
  { name: 'description', label: 'Description', multiline: true },
  { name: 'currencyCode', label: 'Currency Code', defaultValue: 'USD' },
  { name: 'totalShares', label: 'Total Shares', type: 'number', required: true },
  { name: 'sharesIssued', label: 'Shares Issued', type: 'number', required: true },
  { name: 'unitPrice', label: 'Unit Price', type: 'number', required: true },
  { name: 'minimumShares', label: 'Minimum Shares', type: 'number' },
  { name: 'nominalShares', label: 'Nominal Shares', type: 'number' },
  { name: 'maximumShares', label: 'Maximum Shares', type: 'number' },
  { name: 'allowDividendCalculationForInactiveClients', label: 'Allow Dividend for Inactive Clients', options: [{ value: true, label: 'Yes' }, { value: false, label: 'No' }] },
];

export default function ShareProducts() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false, edit: null });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getShareProducts()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSubmit = async (values) => {
    const payload = { ...values, locale: 'en', accountingRule: 1 };
    if (dialog.edit) await updateShareProduct(dialog.edit.id, payload);
    else await createShareProduct(payload);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'shortName', headerName: 'Short Name', width: 120 },
    { field: 'totalShares', headerName: 'Total Shares', width: 130 },
    { field: 'unitPrice', headerName: 'Unit Price', width: 120 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
        <EditIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Share Products</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true, edit: null })} addLabel="New Share Product" />
      <FormDialog open={dialog.open} title={dialog.edit ? 'Edit Share Product' : 'Create Share Product'} fields={fields} initialValues={dialog.edit} onSubmit={handleSubmit} onClose={() => setDialog({ open: false, edit: null })} />
    </Box>
  );
}
