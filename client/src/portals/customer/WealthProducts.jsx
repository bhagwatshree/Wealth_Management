import { useEffect, useState, useCallback } from 'react';
import {
  Typography, Box, Chip, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Grid, Divider, TextField, Alert,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getProducts, getProduct, getNav } from '../../api/offersApi';
import { submitApplication } from '../../api/orchestrationApi';
import { useAuth } from '../../hooks/useAuth';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';
import { formatCurrency } from '../../utils/formatters';

const CATEGORY_FILTERS = [
  { label: 'All', value: null },
  { label: 'Equities', value: 'EQUITIES' },
  { label: 'Fixed Income', value: 'FIXED_INCOME' },
  { label: 'Savings', value: 'SAVINGS' },
  { label: 'Investment Funds', value: 'INVESTMENT_FUNDS' },
];

const riskColor = (level) => {
  switch (level) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    default: return 'default';
  }
};

export default function WealthProducts() {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [applyForm, setApplyForm] = useState({ amount: '', notes: '' });
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchProducts = useCallback(() => {
    const params = { status: 'ACTIVE' };
    if (categoryFilter) params.category = categoryFilter;
    return getProducts(params);
  }, [categoryFilter]);

  const { rows, loading, pageError, clearPageError, load } = usePageData(fetchProducts);

  const [detailDialog, setDetailDialog] = useState({ open: false, product: null });
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState(null);
  const [navData, setNavData] = useState(null);

  useEffect(() => { load(); }, [load]);

  const handleRowClick = async (row) => {
    setDetailDialog({ open: true, product: null });
    setDetailLoading(true);
    setDetailError(null);
    setNavData(null);
    try {
      const product = await getProduct(row.id);
      setDetailDialog({ open: true, product });
      if (product.navEnabled && product.fundCode) {
        try {
          const nav = await getNav(product.fundCode);
          setNavData(nav);
        } catch {
          // NAV not available, not critical
        }
      }
    } catch (err) {
      setDetailError(parseApiError(err));
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailDialog({ open: false, product: null });
    setDetailError(null);
    setNavData(null);
    setApplyForm({ amount: '', notes: '' });
  };

  const handleApplyWealth = async () => {
    if (!detailDialog.product) return;
    setApplying(true);
    try {
      await submitApplication({
        customerId: user?.email || user?.name,
        customerName: user?.name,
        customerEmail: user?.email,
        type: 'WEALTH_PRODUCT',
        productId: detailDialog.product.id,
        productName: detailDialog.product.name || '',
        amount: applyForm.amount || null,
        notes: applyForm.notes,
      });
      closeDetail();
      setApplySuccess(true);
    } catch (e) {
      setDetailError(parseApiError(e));
    } finally {
      setApplying(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 180 },
    { field: 'category', headerName: 'Category', width: 150 },
    { field: 'type', headerName: 'Type', width: 150 },
    {
      field: 'minInvestment', headerName: 'Min Investment', width: 140,
      renderCell: (params) => formatCurrency(params.value, params.row.currency || 'KES'),
    },
    {
      field: 'expectedReturn', headerName: 'Expected Return', width: 140,
      renderCell: (params) => params.value != null ? `${params.value}%` : '-',
    },
    {
      field: 'riskLevel', headerName: 'Risk Level', width: 120,
      renderCell: (params) => params.value
        ? <Chip label={params.value} size="small" color={riskColor(params.value)} />
        : '-',
    },
    {
      field: 'navEnabled', headerName: 'NAV', width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
        />
      ),
    },
  ];

  const p = detailDialog.product;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Wealth Products</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Browse available wealth and investment products.
      </Typography>
      {applySuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setApplySuccess(false)}>
          Application submitted! Track it under "My Applications".
        </Alert>
      )}
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}

      {/* Category Filter Chips */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {CATEGORY_FILTERS.map((cf) => (
          <Chip
            key={cf.label}
            label={cf.label}
            onClick={() => setCategoryFilter(cf.value)}
            color={categoryFilter === cf.value ? 'primary' : 'default'}
            variant={categoryFilter === cf.value ? 'filled' : 'outlined'}
          />
        ))}
      </Stack>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
      />

      {/* Product Detail Dialog */}
      <Dialog open={detailDialog.open} onClose={closeDetail} maxWidth="sm" fullWidth>
        <DialogTitle>{p ? p.name : 'Product Details'}</DialogTitle>
        <DialogContent>
          {detailError && <ErrorAlert error={detailError} onClose={() => setDetailError(null)} />}
          {detailLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Loading product details...</Typography>
          ) : p ? (
            <Box sx={{ mt: 1 }}>
              {p.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{p.description}</Typography>
              )}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Category</Typography>
                  <Typography variant="body2">{p.category || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body2">{p.type || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Currency</Typography>
                  <Typography variant="body2">{p.currency || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Risk Level</Typography>
                  <Box>{p.riskLevel ? <Chip label={p.riskLevel} size="small" color={riskColor(p.riskLevel)} /> : '-'}</Box>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Min Investment</Typography>
                  <Typography variant="body2">{formatCurrency(p.minInvestment, p.currency || 'KES')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Max Investment</Typography>
                  <Typography variant="body2">{formatCurrency(p.maxInvestment, p.currency || 'KES')}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Expected Return</Typography>
                  <Typography variant="body2">{p.expectedReturn != null ? `${p.expectedReturn}%` : '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Tenor</Typography>
                  <Typography variant="body2">{p.tenor != null ? `${p.tenor} days` : '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Fund Manager</Typography>
                  <Typography variant="body2">{p.fundManagerName || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Status</Typography>
                  <Typography variant="body2">{p.status || '-'}</Typography>
                </Grid>
              </Grid>

              {/* NAV Section */}
              {p.navEnabled && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>NAV Information</Typography>
                  {navData ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">NAV Value</Typography>
                        <Typography variant="body2">{formatCurrency(navData.navValue, navData.currency || p.currency || 'KES')}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">NAV Date</Typography>
                        <Typography variant="body2">{navData.navDate || '-'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">AUM</Typography>
                        <Typography variant="body2">{navData.aum != null ? formatCurrency(navData.aum, navData.currency || 'KES') : '-'}</Typography>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body2" color="text.secondary">NAV data not available.</Typography>
                  )}
                </>
              )}

              {/* Apply Section */}
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>Apply for this Product</Typography>
              <Alert severity="info" sx={{ mb: 2 }} variant="outlined">
                KYC is not required to apply. Your request will be sent for admin review.
              </Alert>
              <TextField
                label="Investment Amount"
                type="number"
                fullWidth
                size="small"
                sx={{ mb: 1.5 }}
                value={applyForm.amount}
                onChange={(e) => setApplyForm((f) => ({ ...f, amount: e.target.value }))}
              />
              <TextField
                label="Notes (optional)"
                fullWidth
                size="small"
                multiline
                rows={2}
                value={applyForm.notes}
                onChange={(e) => setApplyForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDetail}>Close</Button>
          {p && (
            <Button variant="contained" startIcon={<SendIcon />} onClick={handleApplyWealth} disabled={applying}>
              {applying ? 'Submitting...' : 'Apply Now'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
