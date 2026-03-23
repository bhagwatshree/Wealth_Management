import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography, Box, Card, CardContent, Grid, Chip, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Alert, Stack,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { getLoanProduct, getSavingsProduct } from '../../api/customerApi';
import { submitApplication } from '../../api/orchestrationApi';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatCurrency } from '../../utils/formatters';

export default function ProductDetail() {
  const { type, id } = useParams();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ amount: '', notes: '' });
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetcher = type === 'loan' ? getLoanProduct : getSavingsProduct;
    fetcher(id)
      .then(setProduct)
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, [type, id]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await submitApplication({
        customerId: user?.email || user?.name,
        customerName: user?.name,
        customerEmail: user?.email,
        type: type === 'loan' ? 'LOAN' : 'SAVINGS_ACCOUNT',
        productId: id,
        productName: product?.name || '',
        amount: applyForm.amount || null,
        notes: applyForm.notes,
      });
      setApplyOpen(false);
      setApplyForm({ amount: '', notes: '' });
      setApplySuccess(true);
    } catch (e) {
      setPageError(parseApiError(e));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (pageError) return <ErrorAlert error={pageError} onClose={() => setPageError(null)} />;
  if (!product) return <Typography>Product not found</Typography>;

  const isLoan = type === 'loan';

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>{product.name}</Typography>
          <Chip label={isLoan ? 'Loan Product' : 'Savings Product'} color="primary" />
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<SendIcon />}
          onClick={() => setApplyOpen(true)}
          sx={{ mt: 1 }}
        >
          {isLoan ? 'Apply for Loan' : 'Open Account'}
        </Button>
      </Stack>

      {applySuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setApplySuccess(false)}>
          Application submitted successfully! You can track it under "My Applications".
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>General</Typography>
              <InfoRow label="Short Name" value={product.shortName} />
              <InfoRow label="Currency" value={product.currency?.code || product.currency?.name} />
              {isLoan && <InfoRow label="Fund" value={product.fundName} />}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>{isLoan ? 'Loan Terms' : 'Interest'}</Typography>
              {isLoan ? (
                <>
                  <InfoRow label="Min Principal" value={formatCurrency(product.minPrincipal)} />
                  <InfoRow label="Max Principal" value={formatCurrency(product.maxPrincipal)} />
                  <InfoRow label="Interest Rate" value={`${product.interestRatePerPeriod}%`} />
                  <InfoRow label="Min Installments" value={product.minNumberOfRepayments} />
                  <InfoRow label="Max Installments" value={product.maxNumberOfRepayments} />
                </>
              ) : (
                <>
                  <InfoRow label="Annual Interest Rate" value={`${product.nominalAnnualInterestRate}%`} />
                  <InfoRow label="Compounding" value={product.interestCompoundingPeriodType?.value} />
                  <InfoRow label="Posting Period" value={product.interestPostingPeriodType?.value} />
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Apply Dialog */}
      <Dialog open={applyOpen} onClose={() => setApplyOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isLoan ? 'Apply for Loan' : 'Open Savings Account'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, mt: 1 }}>
            Product: <strong>{product.name}</strong>
          </Typography>
          <Alert severity="info" sx={{ mb: 2 }}>
            Your application will be sent for review. KYC is not required to apply — you can complete it later.
          </Alert>
          <TextField
            label={isLoan ? 'Loan Amount Requested' : 'Initial Deposit Amount'}
            type="number"
            fullWidth
            size="small"
            sx={{ mb: 2 }}
            value={applyForm.amount}
            onChange={(e) => setApplyForm((f) => ({ ...f, amount: e.target.value }))}
          />
          <TextField
            label="Notes (optional)"
            fullWidth
            size="small"
            multiline
            rows={3}
            value={applyForm.notes}
            onChange={(e) => setApplyForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Any additional details..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setApplyOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleApply} disabled={applying}>
            {applying ? 'Submitting...' : 'Submit Application'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid #f0f0f0' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
    </Box>
  );
}
