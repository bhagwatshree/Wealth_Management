import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, TextField, Button, Alert, Stepper,
  Step, StepLabel, Divider, Stack, Chip, IconButton, Paper,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BadgeIcon from '@mui/icons-material/Badge';
import HomeIcon from '@mui/icons-material/Home';
import { useAuth } from '../../hooks/useAuth';
import { startOnboarding } from '../../api/orchestrationApi';
import { uploadClientDocument, uploadClientImage } from '../../api/customerApi';
import LoadingSpinner from '../../components/LoadingSpinner';

const STEPS = ['Personal Details', 'Identity Documents', 'Address Proof', 'Selfie / Photo'];

function FileUploadBox({ label, accept, file, onFileSelect, onRemove, icon }) {
  const inputRef = useRef(null);
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2, textAlign: 'center', cursor: 'pointer', borderStyle: 'dashed',
        borderColor: file ? 'success.main' : 'grey.400',
        bgcolor: file ? 'success.50' : 'grey.50',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
      onClick={() => !file && inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept={accept} hidden onChange={(e) => {
        if (e.target.files?.[0]) onFileSelect(e.target.files[0]);
      }} />
      {file ? (
        <Stack alignItems="center" spacing={1}>
          <CheckCircleIcon color="success" sx={{ fontSize: 40 }} />
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>{file.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {(file.size / 1024).toFixed(1)} KB
          </Typography>
          <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onRemove(); }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      ) : (
        <Stack alignItems="center" spacing={1}>
          {icon || <CloudUploadIcon sx={{ fontSize: 40, color: 'grey.500' }} />}
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          <Typography variant="caption" color="text.secondary">Click to upload (max 10MB)</Typography>
        </Stack>
      )}
    </Paper>
  );
}

export default function EKYCPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const nameParts = (user?.name || '').replace(/\./g, ' ').trim().split(/\s+/);

  const [form, setForm] = useState({
    firstName: user?.firstName || nameParts[0] || '',
    lastName: user?.lastName || nameParts.slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    nationalId: user?.nationalId || '',
    mpesaNumber: user?.mpesaNumber || '',
    address: {
      addressLine1: user?.address?.addressLine1 || '',
      addressLine2: user?.address?.addressLine2 || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || 'Tanzania',
    },
  });

  // Document files
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [addressProof, setAddressProof] = useState(null);
  const [selfie, setSelfie] = useState(null);

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const updateAddress = (field, value) => setForm(prev => ({
    ...prev, address: { ...prev.address, [field]: value },
  }));

  const canProceed = () => {
    if (activeStep === 0) return form.firstName && form.lastName && form.email && form.dateOfBirth;
    if (activeStep === 1) return idFront;
    if (activeStep === 2) return true; // address proof is optional
    if (activeStep === 3) return selfie;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const customerId = user?.email || user?.name;
      const clientId = user?.fineractClientId;

      // 1. Submit KYC data via onboarding
      await startOnboarding({
        customerId,
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        mobileNo: form.phone || form.mpesaNumber,
        address: form.address,
        dateOfBirth: form.dateOfBirth,
        nationalId: form.nationalId,
      });

      // 2. Upload documents to Fineract if client exists
      if (clientId) {
        const uploads = [];
        if (idFront) uploads.push(uploadClientDocument(clientId, idFront, 'ID Document - Front', 'National ID or Passport front side'));
        if (idBack) uploads.push(uploadClientDocument(clientId, idBack, 'ID Document - Back', 'National ID or Passport back side'));
        if (addressProof) uploads.push(uploadClientDocument(clientId, addressProof, 'Address Proof', 'Utility bill or bank statement'));
        if (selfie) uploads.push(uploadClientImage(clientId, selfie));

        const results = await Promise.allSettled(uploads);
        const failed = results.filter(r => r.status === 'rejected');
        if (failed.length > 0) {
          console.warn('Some document uploads failed:', failed.map(f => f.reason?.message));
        }
      }

      // 3. Update local profile
      login({
        ...user,
        name: `${form.firstName} ${form.lastName}`,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        nationalId: form.nationalId,
        mpesaNumber: form.mpesaNumber,
        address: form.address,
        kycSubmitted: true,
      });

      setSuccess(true);
      setTimeout(() => navigate('/customer/my-account'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'KYC submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h5" gutterBottom>KYC Submitted Successfully</Typography>
        <Typography color="text.secondary">
          Your KYC documents have been submitted for review. You will be notified once verification is complete.
        </Typography>
        <Button variant="contained" sx={{ mt: 3 }} onClick={() => navigate('/customer/my-account')}>
          Back to My Account
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>eKYC Verification</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete your identity verification by providing personal details and uploading required documents.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* Step 0: Personal Details */}
          {activeStep === 0 && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Personal Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="First Name" fullWidth size="small" required
                    value={form.firstName} onChange={(e) => updateForm('firstName', e.target.value)}
                    error={!form.firstName} helperText={!form.firstName ? 'Required' : ''} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Last Name" fullWidth size="small" required
                    value={form.lastName} onChange={(e) => updateForm('lastName', e.target.value)}
                    error={!form.lastName} helperText={!form.lastName ? 'Required' : ''} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Email" fullWidth size="small" type="email" disabled
                    value={form.email} helperText="Cannot be changed" />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Date of Birth" fullWidth size="small" type="date" required
                    InputLabelProps={{ shrink: true }}
                    value={form.dateOfBirth} onChange={(e) => updateForm('dateOfBirth', e.target.value)}
                    error={!form.dateOfBirth} helperText={!form.dateOfBirth ? 'Required' : ''} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Phone Number" fullWidth size="small" placeholder="+255 7XX XXX XXX"
                    value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="National ID / Passport Number" fullWidth size="small" required
                    value={form.nationalId} onChange={(e) => updateForm('nationalId', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="M-Pesa Number" fullWidth size="small" placeholder="+255 7XX XXX XXX"
                    value={form.mpesaNumber} onChange={(e) => updateForm('mpesaNumber', e.target.value)} />
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle2" sx={{ mb: 2 }}>Residential Address</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="Address Line 1" fullWidth size="small" placeholder="Street address"
                    value={form.address.addressLine1} onChange={(e) => updateAddress('addressLine1', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Address Line 2" fullWidth size="small" placeholder="Apt, Suite (optional)"
                    value={form.address.addressLine2} onChange={(e) => updateAddress('addressLine2', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="City" fullWidth size="small"
                    value={form.address.city} onChange={(e) => updateAddress('city', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="State / Province" fullWidth size="small"
                    value={form.address.state} onChange={(e) => updateAddress('state', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Postal Code" fullWidth size="small"
                    value={form.address.postalCode} onChange={(e) => updateAddress('postalCode', e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="Country" fullWidth size="small"
                    value={form.address.country} onChange={(e) => updateAddress('country', e.target.value)} />
                </Grid>
              </Grid>
            </>
          )}

          {/* Step 1: Identity Documents */}
          {activeStep === 1 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Identity Documents</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload a clear photo of your National ID, Passport, or Driver's License.
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Front Side *</Typography>
                  <FileUploadBox
                    label="Upload ID Front"
                    accept="image/*,.pdf"
                    file={idFront}
                    onFileSelect={setIdFront}
                    onRemove={() => setIdFront(null)}
                    icon={<BadgeIcon sx={{ fontSize: 40, color: 'grey.500' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Back Side (optional)</Typography>
                  <FileUploadBox
                    label="Upload ID Back"
                    accept="image/*,.pdf"
                    file={idBack}
                    onFileSelect={setIdBack}
                    onRemove={() => setIdBack(null)}
                    icon={<BadgeIcon sx={{ fontSize: 40, color: 'grey.500' }} />}
                  />
                </Grid>
              </Grid>
              {!idFront && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  At least the front side of your ID is required to proceed.
                </Alert>
              )}
            </>
          )}

          {/* Step 2: Address Proof */}
          {activeStep === 2 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Address Proof</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload a utility bill, bank statement, or government letter showing your residential address (optional but recommended).
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FileUploadBox
                    label="Upload Address Proof"
                    accept="image/*,.pdf"
                    file={addressProof}
                    onFileSelect={setAddressProof}
                    onRemove={() => setAddressProof(null)}
                    icon={<HomeIcon sx={{ fontSize: 40, color: 'grey.500' }} />}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Step 3: Selfie */}
          {activeStep === 3 && (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>Selfie / Photo Verification</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Upload a clear selfie photo. This will be matched against your ID document for verification.
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <FileUploadBox
                    label="Upload Selfie"
                    accept="image/*"
                    file={selfie}
                    onFileSelect={setSelfie}
                    onRemove={() => setSelfie(null)}
                    icon={<PhotoCameraIcon sx={{ fontSize: 40, color: 'grey.500' }} />}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>Photo Guidelines</Typography>
                    <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2 }}>
                      <li>Face clearly visible, no sunglasses</li>
                      <li>Good lighting, neutral background</li>
                      <li>Recent photo (within 6 months)</li>
                      <li>JPEG or PNG format</li>
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}

          {/* Navigation */}
          <Divider sx={{ my: 3 }} />
          <Stack direction="row" justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={() => setActiveStep(s => s - 1)}
              disabled={activeStep === 0}
            >
              Back
            </Button>
            <Stack direction="row" spacing={2}>
              {activeStep < STEPS.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={() => setActiveStep(s => s + 1)}
                  disabled={!canProceed()}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleSubmit}
                  disabled={submitting || !canProceed()}
                  startIcon={submitting ? null : <CheckCircleIcon />}
                >
                  {submitting ? 'Submitting...' : 'Submit KYC'}
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Summary chips */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
            {form.firstName && form.lastName && <Chip size="small" color="success" label="Personal Details" icon={<CheckCircleIcon />} />}
            {idFront && <Chip size="small" color="success" label="ID Document" icon={<CheckCircleIcon />} />}
            {addressProof && <Chip size="small" color="success" label="Address Proof" icon={<CheckCircleIcon />} />}
            {selfie && <Chip size="small" color="success" label="Selfie" icon={<CheckCircleIcon />} />}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
