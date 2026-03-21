import { useState, useEffect } from 'react';
import { Typography, Box, FormControl, InputLabel, Select, MenuItem, Card, CardContent, Grid } from '@mui/material';
import { getLoanProducts, getSavingsProducts } from '../../api/customerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatCurrency } from '../../utils/formatters';

export default function CompareProducts() {
  const [loanProducts, setLoanProducts] = useState([]);
  const [savingsProducts, setSavingsProducts] = useState([]);
  const [selected, setSelected] = useState([null, null]);
  const [productType, setProductType] = useState('loan');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLoanProducts(), getSavingsProducts()])
      .then(([l, s]) => { setLoanProducts(l); setSavingsProducts(s); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const products = productType === 'loan' ? loanProducts : savingsProducts;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Compare Products</Typography>
      <FormControl size="small" sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Product Type</InputLabel>
        <Select value={productType} label="Product Type" onChange={(e) => { setProductType(e.target.value); setSelected([null, null]); }}>
          <MenuItem value="loan">Loan Products</MenuItem>
          <MenuItem value="savings">Savings Products</MenuItem>
        </Select>
      </FormControl>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[0, 1].map(idx => (
          <Grid item xs={12} md={6} key={idx}>
            <FormControl fullWidth size="small">
              <InputLabel>Product {idx + 1}</InputLabel>
              <Select value={selected[idx] || ''} label={`Product ${idx + 1}`} onChange={(e) => {
                const next = [...selected]; next[idx] = e.target.value; setSelected(next);
              }}>
                {products.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {selected.map((id, idx) => {
          const p = products.find(x => x.id === id);
          if (!p) return <Grid item xs={12} md={6} key={idx}><Card><CardContent><Typography color="text.secondary">Select a product</Typography></CardContent></Card></Grid>;
          return (
            <Grid item xs={12} md={6} key={idx}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{p.name}</Typography>
                  {productType === 'loan' ? (
                    <>
                      <Row label="Interest Rate" value={`${p.interestRatePerPeriod}%`} />
                      <Row label="Min Principal" value={formatCurrency(p.minPrincipal)} />
                      <Row label="Max Principal" value={formatCurrency(p.maxPrincipal)} />
                      <Row label="Installments" value={`${p.minNumberOfRepayments} - ${p.maxNumberOfRepayments}`} />
                    </>
                  ) : (
                    <>
                      <Row label="Annual Interest" value={`${p.nominalAnnualInterestRate}%`} />
                      <Row label="Currency" value={p.currency?.code} />
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

function Row({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid #f0f0f0' }}>
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
    </Box>
  );
}
