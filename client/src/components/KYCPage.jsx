import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Container, Button, Stepper, Step, StepLabel,
  Alert, TextField, Chip, Divider, Paper,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import WarningIcon from '@mui/icons-material/Warning';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { useAuth, ROLES, ROLE_PATHS } from '../hooks/useAuth';

const KYC_STEPS = {
  [ROLES.CUSTOMER]: ['Identity Verification', 'Address Proof', 'Financial Details', 'eKYC'],
  [ROLES.FUND_MANAGER]: ['Organization Verification', 'Regulatory Compliance', 'Authorized Signatory', 'eKYC'],
  [ROLES.SERVICE_PROVIDER]: ['Organization Verification', 'System Access Authorization', 'Admin Verification', 'eKYC'],
};

export default function KYCPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  if (!user) { navigate('/login'); return null; }
  if (user.kycComplete) { navigate(ROLE_PATHS[user.role]); return null; }

  const steps = KYC_STEPS[user.role] || KYC_STEPS[ROLES.CUSTOMER];
  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleNext = () => {
    setError('');
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      // KYC complete — skip eKYC for now
      login({ ...user, kycComplete: true });
      navigate(ROLE_PATHS[user.role]);
    }
  };

  const handleSkip = () => {
    login({ ...user, kycComplete: true });
    navigate(ROLE_PATHS[user.role]);
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', py: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" gutterBottom fontWeight={700}>
          KYC Verification
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Complete your Know Your Customer verification to access {user.role === ROLES.CUSTOMER ? 'financial products' : 'your portal'}
        </Typography>

        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {steps.map(s => <Step key={s}><StepLabel>{s}</StepLabel></Step>)}
        </Stepper>

        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Step content based on role and step */}
            {step < steps.length - 1 ? (
              <RoleStepContent role={user.role} step={step} form={form} update={update} />
            ) : (
              /* eKYC placeholder - last step */
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <FingerprintIcon sx={{ fontSize: 80, color: '#1565c0', mb: 2 }} />
                <Typography variant="h5" gutterBottom fontWeight={600}>eKYC Verification</Typography>
                <Alert severity="warning" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                  <Typography variant="body2">
                    eKYC verification via Aadhaar/DigiLocker is currently unavailable.
                    Your account will be provisionally approved based on the details you have provided.
                  </Typography>
                </Alert>
                <Paper variant="outlined" sx={{ p: 3, maxWidth: 400, mx: 'auto', bgcolor: '#fafafa', borderStyle: 'dashed' }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: '#9e9e9e', mb: 1 }} />
                  <Typography variant="body2" color="text.secondary">
                    eKYC integration placeholder
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Aadhaar OTP / DigiLocker / Video KYC will be integrated here
                  </Typography>
                </Paper>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button variant="outlined" onClick={handleSkip} color="inherit">
                  Skip for now
                </Button>
                <Button variant="contained" onClick={handleNext}>
                  {step === steps.length - 1 ? 'Complete KYC' : 'Next'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

function RoleStepContent({ role, step, form, update }) {
  if (role === ROLES.CUSTOMER) {
    if (step === 0) return (
      <Box>
        <Typography variant="h6" gutterBottom>Identity Verification</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Provide your identity documents</Typography>
        <TextField label="PAN Number" fullWidth size="small" sx={{ mb: 2 }} value={form.pan || ''} onChange={update('pan')} placeholder="ABCDE1234F" />
        <TextField label="Aadhaar Number" fullWidth size="small" sx={{ mb: 2 }} value={form.aadhaar || ''} onChange={update('aadhaar')} placeholder="XXXX XXXX XXXX" />
        <TextField label="Date of Birth" type="date" fullWidth size="small" sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} value={form.dob || ''} onChange={update('dob')} />
        <UploadPlaceholder label="Upload PAN Card" />
      </Box>
    );
    if (step === 1) return (
      <Box>
        <Typography variant="h6" gutterBottom>Address Proof</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Provide your current address details</Typography>
        <TextField label="Address Line 1" fullWidth size="small" sx={{ mb: 2 }} value={form.address1 || ''} onChange={update('address1')} />
        <TextField label="Address Line 2" fullWidth size="small" sx={{ mb: 2 }} value={form.address2 || ''} onChange={update('address2')} />
        <TextField label="City" fullWidth size="small" sx={{ mb: 2 }} value={form.city || ''} onChange={update('city')} />
        <TextField label="State" fullWidth size="small" sx={{ mb: 2 }} value={form.state || ''} onChange={update('state')} />
        <TextField label="PIN Code" fullWidth size="small" sx={{ mb: 2 }} value={form.pincode || ''} onChange={update('pincode')} />
        <UploadPlaceholder label="Upload Address Proof (Utility Bill / Bank Statement)" />
      </Box>
    );
    if (step === 2) return (
      <Box>
        <Typography variant="h6" gutterBottom>Financial Details</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Basic financial information</Typography>
        <TextField label="Annual Income (INR)" fullWidth size="small" sx={{ mb: 2 }} type="number" value={form.income || ''} onChange={update('income')} />
        <TextField label="Occupation" fullWidth size="small" sx={{ mb: 2 }} value={form.occupation || ''} onChange={update('occupation')} />
        <TextField label="Bank Account Number" fullWidth size="small" sx={{ mb: 2 }} value={form.bankAccount || ''} onChange={update('bankAccount')} />
        <TextField label="IFSC Code" fullWidth size="small" sx={{ mb: 2 }} value={form.ifsc || ''} onChange={update('ifsc')} />
      </Box>
    );
  }

  if (role === ROLES.FUND_MANAGER) {
    if (step === 0) return (
      <Box>
        <Typography variant="h6" gutterBottom>Organization Verification</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Verify your AMC / fund house details</Typography>
        <TextField label="Organization / AMC Name" fullWidth size="small" sx={{ mb: 2 }} value={form.orgName || ''} onChange={update('orgName')} />
        <TextField label="CIN (Corporate Identification Number)" fullWidth size="small" sx={{ mb: 2 }} value={form.cin || ''} onChange={update('cin')} />
        <TextField label="Registered Office Address" fullWidth size="small" sx={{ mb: 2 }} value={form.regAddress || ''} onChange={update('regAddress')} />
        <UploadPlaceholder label="Upload Certificate of Incorporation" />
      </Box>
    );
    if (step === 1) return (
      <Box>
        <Typography variant="h6" gutterBottom>Regulatory Compliance</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>SEBI and regulatory information</Typography>
        <TextField label="SEBI Registration Number" fullWidth size="small" sx={{ mb: 2 }} value={form.sebiReg || ''} onChange={update('sebiReg')} placeholder="INF000000000" />
        <TextField label="AMFI Registration Number" fullWidth size="small" sx={{ mb: 2 }} value={form.amfiReg || ''} onChange={update('amfiReg')} />
        <TextField label="License Expiry Date" type="date" fullWidth size="small" sx={{ mb: 2 }} InputLabelProps={{ shrink: true }} value={form.licenseExpiry || ''} onChange={update('licenseExpiry')} />
        <UploadPlaceholder label="Upload SEBI Registration Certificate" />
      </Box>
    );
    if (step === 2) return (
      <Box>
        <Typography variant="h6" gutterBottom>Authorized Signatory</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Details of the authorized person</Typography>
        <TextField label="Signatory Name" fullWidth size="small" sx={{ mb: 2 }} value={form.signatoryName || ''} onChange={update('signatoryName')} />
        <TextField label="Signatory PAN" fullWidth size="small" sx={{ mb: 2 }} value={form.signatoryPan || ''} onChange={update('signatoryPan')} />
        <TextField label="Designation" fullWidth size="small" sx={{ mb: 2 }} value={form.sigDesignation || ''} onChange={update('sigDesignation')} />
        <UploadPlaceholder label="Upload Board Resolution / Authorization Letter" />
      </Box>
    );
  }

  if (role === ROLES.SERVICE_PROVIDER) {
    if (step === 0) return (
      <Box>
        <Typography variant="h6" gutterBottom>Organization Verification</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Verify your organization</Typography>
        <TextField label="Organization Name" fullWidth size="small" sx={{ mb: 2 }} value={form.orgName || ''} onChange={update('orgName')} />
        <TextField label="GST Number" fullWidth size="small" sx={{ mb: 2 }} value={form.gst || ''} onChange={update('gst')} />
        <TextField label="Registered Address" fullWidth size="small" sx={{ mb: 2 }} value={form.regAddress || ''} onChange={update('regAddress')} />
        <UploadPlaceholder label="Upload GST Certificate" />
      </Box>
    );
    if (step === 1) return (
      <Box>
        <Typography variant="h6" gutterBottom>System Access Authorization</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Admin access justification</Typography>
        <TextField label="Employee ID" fullWidth size="small" sx={{ mb: 2 }} value={form.employeeId || ''} onChange={update('employeeId')} />
        <TextField label="Department" fullWidth size="small" sx={{ mb: 2 }} value={form.department || ''} onChange={update('department')} />
        <TextField label="Access Level Requested" fullWidth size="small" sx={{ mb: 2 }} value={form.accessLevel || ''} onChange={update('accessLevel')} placeholder="Full Admin / Read Only / Reports Only" />
        <TextField label="Justification" fullWidth size="small" multiline rows={3} sx={{ mb: 2 }} value={form.justification || ''} onChange={update('justification')} />
      </Box>
    );
    if (step === 2) return (
      <Box>
        <Typography variant="h6" gutterBottom>Admin Verification</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Supervisor approval</Typography>
        <TextField label="Supervisor Name" fullWidth size="small" sx={{ mb: 2 }} value={form.supervisorName || ''} onChange={update('supervisorName')} />
        <TextField label="Supervisor Email" fullWidth size="small" sx={{ mb: 2 }} value={form.supervisorEmail || ''} onChange={update('supervisorEmail')} />
        <Alert severity="info" sx={{ mb: 2 }}>
          An approval request will be sent to your supervisor for verification.
        </Alert>
        <UploadPlaceholder label="Upload Signed Authorization Form" />
      </Box>
    );
  }

  return null;
}

function UploadPlaceholder({ label }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', bgcolor: '#fafafa', borderStyle: 'dashed', mb: 2 }}>
      <CloudUploadIcon sx={{ fontSize: 32, color: '#9e9e9e', mb: 0.5 }} />
      <Typography variant="body2" color="text.secondary">{label}</Typography>
      <Button size="small" sx={{ mt: 1 }} disabled>Upload (Coming Soon)</Button>
    </Paper>
  );
}
