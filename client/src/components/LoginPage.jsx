import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, ToggleButtonGroup,
  ToggleButton, Container, Alert, Link as MuiLink,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth, ROLES, ROLE_PATHS } from '../hooks/useAuth';

const ROLE_CONFIG = [
  { value: ROLES.CUSTOMER, label: 'Customer', icon: <PersonIcon />, color: '#1565c0' },
  { value: ROLES.FUND_MANAGER, label: 'Fund Manager', icon: <AccountBalanceIcon />, color: '#00897b' },
  { value: ROLES.SERVICE_PROVIDER, label: 'Service Provider', icon: <AdminPanelSettingsIcon />, color: '#e65100' },
];

export default function LoginPage() {
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields'); return; }

    // Simulated auth — in production this would call an API
    login({ email, role, name: email.split('@')[0], kycComplete: false });
    navigate('/kyc');
  };

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1565c0 0%, #00897b 100%)', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Typography variant="h3" align="center" sx={{ color: '#fff', mb: 1, fontWeight: 700 }}>
          Wealth Management
        </Typography>
        <Typography variant="body1" align="center" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
          Sign in to access your portal
        </Typography>
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
              }}>
                Sign In
              </Button>
            </form>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Don't have an account?{' '}
              <MuiLink href="/signup" sx={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); navigate('/signup'); }}>
                Sign Up
              </MuiLink>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
