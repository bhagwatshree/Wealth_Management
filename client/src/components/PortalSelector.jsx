import { Box, Card, CardContent, CardActions, Button, Typography, Container, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const portals = [
  {
    title: 'Customer Portal',
    description: 'Browse financial products, compare loan and savings offerings, view interest rates and terms.',
    path: '/customer',
    icon: <PersonIcon sx={{ fontSize: 48 }} />,
    color: '#1565c0',
  },
  {
    title: 'Fund Manager Portal',
    description: 'Create and manage loan products, savings products, charges, and funds.',
    path: '/fund-manager',
    icon: <AccountBalanceIcon sx={{ fontSize: 48 }} />,
    color: '#00897b',
  },
  {
    title: 'Service Provider Portal',
    description: 'Admin panel for offices, staff, clients, ledger, reports, audits and system configuration.',
    path: '/service-provider',
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 48 }} />,
    color: '#e65100',
  },
];

export default function PortalSelector() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1565c0 0%, #00897b 100%)', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="lg">
        <Typography variant="h3" align="center" sx={{ color: '#fff', mb: 1, fontWeight: 700 }}>
          Wealth Management
        </Typography>
        <Typography variant="h6" align="center" sx={{ color: 'rgba(255,255,255,0.8)', mb: 5 }}>
          Powered by Apache Fineract
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {portals.map(p => (
            <Grid item xs={12} sm={6} md={4} key={p.path}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 30px rgba(0,0,0,0.15)' } }}>
                <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                  <Box sx={{ color: p.color, mb: 2 }}>{p.icon}</Box>
                  <Typography variant="h5" gutterBottom>{p.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{p.description}</Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                  <Button variant="contained" size="large" onClick={() => navigate(p.path)} sx={{ bgcolor: p.color, px: 4 }}>
                    Enter Portal
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
