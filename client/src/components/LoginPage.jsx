import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, ToggleButtonGroup,
  ToggleButton, Container, Alert, Link as MuiLink, Stack, Divider,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth, ROLES, ROLE_PATHS } from '../hooks/useAuth';
import { registerCustomer } from '../api/customerApi';

const ROLE_CONFIG = [
  { value: ROLES.CUSTOMER, label: 'Customer', icon: <PersonIcon />, color: '#E60000' },
  { value: ROLES.FUND_MANAGER, label: 'Fund Manager', icon: <AccountBalanceIcon />, color: '#00695C' },
  { value: ROLES.SERVICE_PROVIDER, label: 'Service Provider', icon: <AdminPanelSettingsIcon />, color: '#333333' },
];

export default function LoginPage() {
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }

    const name = email.split('@')[0].replace(/[._]/g, ' ');
    // Register/lookup customer in Fineract if customer role
    let fineractClientId = null;
    let accountNo = '';
    if (role === ROLES.CUSTOMER) {
      try {
        const result = await registerCustomer({ email, name });
        fineractClientId = result.fineractClientId;
        accountNo = result.accountNo;
      } catch (err) {
        console.warn('Fineract registration failed, continuing:', err);
      }
    }
    login({ email, role, name, kycComplete: true, fineractClientId, accountNo });
    navigate(ROLE_PATHS[role]);
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #E60000 0%, #990000 50%, #333333 100%)', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        {/* Vodacom Logo Area */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#E60000', fontWeight: 900, fontSize: '1.4rem', lineHeight: 1 }}>V</Typography>
            </Box>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 700 }}>
              Vodacom
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 500, letterSpacing: 1 }}>
            Wealth Management
          </Typography>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} sx={{ mt: 1.5 }}>
            <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.7rem' }}>M</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
              Powered by M-Pesa
            </Typography>
          </Stack>
        </Box>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" align="center" gutterBottom fontWeight={600}>Sign In</Typography>

            <Typography variant="subtitle2" sx={{ mb: 1 }}>Select your role</Typography>
            <ToggleButtonGroup
              value={role}
              exclusive
              onChange={(_, v) => v && setRole(v)}
              fullWidth
              sx={{ mb: 3 }}
            >
              {ROLE_CONFIG.map(r => (
                <ToggleButton key={r.value} value={r.value} sx={{
                  py: 1.5, flexDirection: 'column', gap: 0.5,
                  '&.Mui-selected': { bgcolor: `${r.color}15`, color: r.color, borderColor: r.color },
                }}>
                  {r.icon}
                  <Typography variant="caption">{r.label}</Typography>
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <TextField label="Email" type="email" fullWidth size="small" sx={{ mb: 2 }}
                value={email} onChange={(e) => setEmail(e.target.value)} required />
              <TextField label="Password" type="password" fullWidth size="small" sx={{ mb: 3 }}
                value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" variant="contained" fullWidth size="large" sx={{
                bgcolor: ROLE_CONFIG.find(r => r.value === role)?.color,
                '&:hover': { bgcolor: ROLE_CONFIG.find(r => r.value === role)?.color, filter: 'brightness(0.9)' },
              }}>
                Sign In
              </Button>
            </form>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Don't have an account?{' '}
              <MuiLink href="/signup" sx={{ cursor: 'pointer', color: '#E60000' }} onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
                Sign Up
              </MuiLink>
            </Typography>

            <Divider sx={{ mt: 3, mb: 2 }} />
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={1}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.55rem' }}>M</Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                M-Pesa integration for seamless mobile money transactions
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 3, color: 'rgba(255,255,255,0.6)' }}>
          Vodacom Group Limited. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
