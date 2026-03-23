import { useState, useEffect } from 'react';
import { Typography, Box, IconButton, Alert } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getProductsMix, deleteProductMix } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

export default function ProductsMix() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getProductsMix()
      .then(data => setRows(data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id) => {
    try { await deleteProductMix(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'productId', headerName: 'Product ID', width: 120 },
    { field: 'productName', headerName: 'Product Name', flex: 1 },
    { field: 'restrictedProducts', headerName: 'Restricted Products', flex: 1, valueGetter: (v, row) => {
      if (Array.isArray(row.restrictedProducts)) return row.restrictedProducts.map(p => p.name || p.productName || p.id).join(', ');
      return row.restrictedProducts || '';
    }},
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.id); }}>
        <DeleteIcon fontSize="small" />
      </IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Products Mix</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      {!loading && rows.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>No product mix rules have been configured yet. Product mix rules restrict which loan products can be combined.</Alert>
      )}
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
}
