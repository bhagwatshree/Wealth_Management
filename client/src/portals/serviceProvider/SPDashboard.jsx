import { useState, useEffect } from 'react';
import { Grid, Card, CardContent, Typography, Box } from '@mui/material';
import { getOffices, getStaff, getClients, getGLAccounts } from '../../api/serviceProviderApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function SPDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getOffices(), getStaff(), getClients(), getGLAccounts()])
      .then(([o, s, c, g]) => setStats({
        offices: o.length || 0,
        staff: s.length || 0,
        clients: c.totalFilteredRecords ?? c.length ?? 0,
        glAccounts: g.length || 0,
      }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const cards = [
    { label: 'Offices', value: stats?.offices, icon: <BusinessIcon />, color: '#E60000' },
    { label: 'Staff', value: stats?.staff, icon: <PeopleIcon />, color: '#4CAF50' },
    { label: 'Clients', value: stats?.clients, icon: <PersonIcon />, color: '#00695C' },
    { label: 'GL Accounts', value: stats?.glAccounts, icon: <AccountBalanceIcon />, color: '#333333' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Service Provider Dashboard</Typography>
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
