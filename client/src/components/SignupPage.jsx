import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, TextField, Button, Typography, ToggleButtonGroup,
  ToggleButton, Container, Alert, Link as MuiLink, Stepper, Step, StepLabel, MenuItem,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useAuth, ROLES } from '../hooks/useAuth';

const ROLE_CONFIG = [
  { value: ROLES.CUSTOMER, label: 'Customer', icon: <PersonIcon />, color: '#1565c0' },
  { value: ROLES.FUND_MANAGER, label: 'Fund Manager', icon: <AccountBalanceIcon />, color: '#00897b' },
  { value: ROLES.SERVICE_PROVIDER, label: 'Service Provider', icon: <AdminPanelSettingsIcon />, color: '#e65100' },
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

  const handleNext = () => {
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
      login({ email: form.email, role, name: form.name, phone: form.phone, organization: form.organization, kycComplete: false });
      navigate('/kyc');
    }
  };

  const roleColor = ROLE_CONFIG.find(r => r.value === role)?.color || '#1565c0';

  return (
    <Box sx={{ minHeight: '100vh', background: 'linear-gradient(135deg, #1565c0 0%, #00897b 100%)', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Typography variant="h3" align="center" sx={{ color: '#fff', mb: 1, fontWeight: 700 }}>
          Wealth Management
        </Typography>
        <Typography variant="body1" align="center" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4 }}>
          Create your account
        </Typography>
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
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
                <TextField label="Phone Number" fullWidth size="small" sx={{ mb: 2 }} value={form.phone} onChange={update('phone')} />

                {role === ROLES.CUSTOMER && (
                  <>
                    <TextField label="PAN Number" fullWidth size="small" sx={{ mb: 2 }} value={form.pan} onChange={update('pan')} placeholder="ABCDE1234F" />
                    <TextField label="Aadhaar Number" fullWidth size="small" sx={{ mb: 2 }} value={form.aadhaar} onChange={update('aadhaar')} placeholder="XXXX XXXX XXXX" />
                  </>
                )}

                {role === ROLES.FUND_MANAGER && (
                  <>
                    <TextField label="Organization / AMC Name" fullWidth size="small" sx={{ mb: 2 }} value={form.organization} onChange={update('organization')} required />
                    <TextField label="Designation" fullWidth size="small" sx={{ mb: 2 }} value={form.designation} onChange={update('designation')} />
                    <TextField label="SEBI Registration Number" fullWidth size="small" sx={{ mb: 2 }} placeholder="INF000000000" />
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
              <Button variant="contained" onClick={handleNext} sx={{ bgcolor: roleColor }}>
                {step === 2 ? 'Create Account' : 'Next'}
              </Button>
            </Box>

            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <MuiLink href="/login" sx={{ cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                Sign In
              </MuiLink>
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
