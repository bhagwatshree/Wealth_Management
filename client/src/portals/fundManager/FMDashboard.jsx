import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { getLoanProducts, getSavingsProducts, getCharges, getFunds } from '../../api/fundManagerApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SavingsIcon from '@mui/icons-material/Savings';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

export default function FMDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getLoanProducts(), getSavingsProducts(), getCharges(), getFunds()])
      .then(([lp, sp, ch, fu]) => setStats({
        loanProducts: lp.length || 0,
        savingsProducts: sp.length || 0,
        charges: ch.length || 0,
        funds: fu.length || 0,
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Loan Products', value: stats?.loanProducts, icon: <CreditCardIcon />, color: '#1565c0' },
    { label: 'Savings Products', value: stats?.savingsProducts, icon: <SavingsIcon />, color: '#00897b' },
    { label: 'Charges', value: stats?.charges, icon: <ReceiptIcon />, color: '#ef6c00' },
    { label: 'Funds', value: stats?.funds, icon: <AccountBalanceWalletIcon />, color: '#6a1b9a' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Fund Manager Dashboard</Typography>
      <Grid container spacing={3}>
        {cards.map(c => (
          <Grid item xs={12} sm={6} md={3} key={c.label}>
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
