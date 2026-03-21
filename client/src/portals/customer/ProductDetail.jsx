import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Card, CardContent, Grid, Chip } from '@mui/material';
import { getLoanProduct, getSavingsProduct } from '../../api/customerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatCurrency } from '../../utils/formatters';

export default function ProductDetail() {
  const { type, id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    const fetcher = type === 'loan' ? getLoanProduct : getSavingsProduct;
    fetcher(id)
      .then(setProduct)
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, [type, id]);

  if (loading) return <LoadingSpinner />;
  if (pageError) return <ErrorAlert error={pageError} onClose={() => setPageError(null)} />;
  if (!product) return <Typography>Product not found</Typography>;

  const isLoan = type === 'loan';

  return (
    <Box>
      <Typography variant="h4" gutterBottom>{product.name}</Typography>
      <Chip label={isLoan ? 'Loan Product' : 'Savings Product'} color="primary" sx={{ mb: 3 }} />

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
