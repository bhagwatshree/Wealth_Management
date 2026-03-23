import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box, Alert, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { getLoanProducts, getSavingsProducts } from '../../api/customerApi';
import { getMyApplications } from '../../api/orchestrationApi';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const customerId = user?.email || user?.name;

  useEffect(() => {
    Promise.all([
      getLoanProducts().catch(() => []),
      getSavingsProducts().catch(() => []),
      customerId ? getMyApplications(customerId).catch(() => []) : Promise.resolve([]),
    ])
      .then(([loans, savings, apps]) => setStats({
        loans: loans.length || 0,
        savings: savings.length || 0,
        applications: apps.length || 0,
        pendingApps: apps.filter(a => a.status === 'PENDING').length,
      }))
      .finally(() => setLoading(false));
  }, [customerId]);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Loan Products', value: stats?.loans, icon: <CreditCardIcon />, color: '#E60000', path: '/customer/loan-products' },
    { label: 'Savings Products', value: stats?.savings, icon: <SavingsIcon />, color: '#4CAF50', path: '/customer/savings-products' },
    { label: 'My Applications', value: stats?.applications, icon: <AssignmentIcon />, color: '#00695C', path: '/customer/my-applications' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome, {user?.name || 'Customer'}</Typography>
      {user?.fineractClientId && (
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Fineract Account: <strong>#{user.accountNo || user.fineractClientId}</strong>
          </Typography>
        </Stack>
      )}
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Explore our financial products and apply directly — no KYC required to get started.
      </Typography>

      {stats?.pendingApps > 0 && (
        <Alert severity="info" sx={{ mb: 3 }} action={
          <Button color="inherit" size="small" onClick={() => navigate('/customer/my-applications')}>View</Button>
        }>
          You have {stats.pendingApps} pending application{stats.pendingApps > 1 ? 's' : ''} awaiting review.
        </Alert>
      )}

      <Grid container spacing={3}>
        {cards.map(c => (
          <Grid item xs={12} sm={6} md={4} key={c.label}>
            <Card sx={{ cursor: 'pointer', '&:hover': { boxShadow: 4 } }} onClick={() => navigate(c.path)}>
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
