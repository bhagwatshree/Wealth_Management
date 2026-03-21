import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import { getLoanProducts, getSavingsProducts } from '../../api/customerApi';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CustomerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLoanProducts(), getSavingsProducts()])
      .then(([loans, savings]) => setStats({ loans: loans.length || 0, savings: savings.length || 0 }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Loan Products', value: stats?.loans, icon: <CreditCardIcon />, color: '#1565c0' },
    { label: 'Savings Products', value: stats?.savings, icon: <SavingsIcon />, color: '#00897b' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Explore our financial products and find the right fit for your needs.
      </Typography>
      <Grid container spacing={3}>
        {cards.map(c => (
          <Grid item xs={12} sm={6} md={4} key={c.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${c.color}15`, color: c.color }}>{c.icon}</Box>
                <Box>
                  <Typography variant="h4">{c.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
