import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, ToggleButtonGroup,
  ToggleButton, Container, Alert, Link as MuiLink, Stepper, Step, StepLabel, Stack, Divider,
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

const steps = ['Select Role', 'Account Details', 'Profile Details'];

export default function SignupPage() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(ROLES.CUSTOMER);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', name: '', phone: '', organization: '', designation: '', pan: '', aadhaar: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleNext = async () => {
    setError('');
    if (step === 0) { setStep(1); return; }
    if (step === 1) {
      if (!form.email || !form.password) { setError('Fill in all required fields'); return; }
      if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!form.name) { setError('Name is required'); return; }
      // Register customer in Fineract if customer role
      let fineractClientId = null;
      let accountNo = '';
      if (role === ROLES.CUSTOMER) {
        try {
          const result = await registerCustomer({ email: form.email, name: form.name, phone: form.phone });
          fineractClientId = result.fineractClientId;
          accountNo = result.accountNo;
        } catch (err) {
          console.warn('Fineract registration failed, continuing:', err);
        }
      }
      login({ email: form.email, role, name: form.name, phone: form.phone, organization: form.organization, kycComplete: true, fineractClientId, accountNo });
      navigate(ROLE_PATHS[role]);
    }
  };

  const roleColor = ROLE_CONFIG.find(r => r.value === role)?.color || '#E60000';

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
            <Typography variant="h5" align="center" gutterBottom fontWeight={600}>Create Account</Typography>

            <Stepper activeStep={step} sx={{ mb: 3 }}>
              {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
            </Stepper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {step === 0 && (
              <>
                <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 2 }}>Who are you?</Typography>
                <ToggleButtonGroup value={role} exclusive onChange={(_, v) => v && setRole(v)} fullWidth>
                  {ROLE_CONFIG.map(r => (
                    <ToggleButton key={r.value} value={r.value} sx={{
                      py: 2, flexDirection: 'column', gap: 0.5,
                      '&.Mui-selected': { bgcolor: `${r.color}15`, color: r.color, borderColor: r.color },
                    }}>
                      {r.icon}
                      <Typography variant="caption" fontWeight={500}>{r.label}</Typography>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </>
            )}

            {step === 1 && (
              <>
                <TextField label="Email" type="email" fullWidth size="small" sx={{ mb: 2 }} value={form.email} onChange={update('email')} required />
                <TextField label="Password" type="password" fullWidth size="small" sx={{ mb: 2 }} value={form.password} onChange={update('password')} required />
                <TextField label="Confirm Password" type="password" fullWidth size="small" value={form.confirmPassword} onChange={update('confirmPassword')} required />
              </>
            )}

            {step === 2 && (
              <>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                  {role === ROLES.CUSTOMER ? 'Tell us about yourself' :
                   role === ROLES.FUND_MANAGER ? 'Fund Manager details' :
                   'Service Provider details'}
                </Typography>
                <TextField label="Full Name" fullWidth size="small" sx={{ mb: 2 }} value={form.name} onChange={update('name')} required />
                <TextField label="Phone Number" fullWidth size="small" sx={{ mb: 2 }} value={form.phone} onChange={update('phone')} placeholder="+255 XXX XXX XXX" />

                {role === ROLES.CUSTOMER && (
                  <>
                    <TextField label="M-Pesa Registered Number" fullWidth size="small" sx={{ mb: 2 }} placeholder="+255 7XX XXX XXX" />
                    <TextField label="National ID / Passport" fullWidth size="small" sx={{ mb: 2 }} value={form.pan} onChange={update('pan')} />
                  </>
                )}

                {role === ROLES.FUND_MANAGER && (
                  <>
                    <TextField label="Organization / AMC Name" fullWidth size="small" sx={{ mb: 2 }} value={form.organization} onChange={update('organization')} required />
                    <TextField label="Designation" fullWidth size="small" sx={{ mb: 2 }} value={form.designation} onChange={update('designation')} />
                    <TextField label="Registration Number" fullWidth size="small" sx={{ mb: 2 }} />
                  </>
                )}

                {role === ROLES.SERVICE_PROVIDER && (
                  <>
                    <TextField label="Organization Name" fullWidth size="small" sx={{ mb: 2 }} value={form.organization} onChange={update('organization')} required />
                    <TextField label="Designation" fullWidth size="small" sx={{ mb: 2 }} value={form.designation} onChange={update('designation')} />
                    <TextField label="Employee ID" fullWidth size="small" sx={{ mb: 2 }} />
                  </>
                )}
              </>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
              <Button variant="contained" onClick={handleNext} sx={{
                bgcolor: roleColor,
                '&:hover': { bgcolor: roleColor, filter: 'brightness(0.9)' },
              }}>
                {step === 2 ? 'Create Account' : 'Next'}
              </Button>
            </Box>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <MuiLink href="/login" sx={{ cursor: 'pointer', color: '#E60000' }} onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                Sign In
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
