import { useEffect, useState } from 'react';
import {
  Typography, Box, Card, CardContent, Stack, Chip, Button, Divider, List, ListItem,
  ListItemIcon, ListItemText, Alert, TextField, Grid, IconButton, Collapse,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShieldIcon from '@mui/icons-material/Shield';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import PendingIcon from '@mui/icons-material/Pending';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAccountStatus } from '../../api/orchestrationApi';
import { registerCustomer } from '../../api/customerApi';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { parseApiError } from '../../utils/errorHelper';

const statusConfig = {
  VERIFIED: { label: 'Verified', color: 'success', icon: <CheckCircleIcon /> },
  PASS: { label: 'Passed', color: 'success', icon: <CheckCircleIcon /> },
  PENDING: { label: 'Pending', color: 'warning', icon: <PendingIcon /> },
  UNDER_REVIEW: { label: 'Under Review', color: 'info', icon: <HourglassEmptyIcon /> },
  REJECTED: { label: 'Rejected', color: 'error', icon: <ErrorIcon /> },
  FLAGGED: { label: 'Flagged', color: 'error', icon: <ErrorIcon /> },
  NOT_STARTED: { label: 'Not Started', color: 'default', icon: <PendingIcon /> },
};

function getStatusChip(status) {
  const cfg = statusConfig[status] || statusConfig.NOT_STARTED;
  return <Chip label={cfg.label} color={cfg.color} size="small" icon={cfg.icon} />;
}

export default function MyAccount() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  // Profile editing
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    nationalId: '',
    mpesaNumber: '',
    address: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Tanzania',
    },
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Initialize profile from user data
  useEffect(() => {
    if (user) {
      const nameParts = (user.name || '').replace(/\./g, ' ').trim().split(/\s+/);
      setProfile((p) => ({
        ...p,
        firstName: user.firstName || nameParts[0] || '',
        lastName: user.lastName || nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        nationalId: user.nationalId || '',
        mpesaNumber: user.mpesaNumber || user.phone || '',
        address: {
          addressLine1: user.address?.addressLine1 || '',
          addressLine2: user.address?.addressLine2 || '',
          city: user.address?.city || user.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || user.country || 'Tanzania',
        },
      }));
    }
  }, [user]);

  const customerId = user?.email || user?.name;

  const loadAccount = () => {
    if (!customerId) { setLoading(false); return; }
    setLoading(true);
    setPageError(null);
    getAccountStatus(customerId)
      .then((data) => setAccount(data))
      .catch((err) => setPageError(parseApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAccount(); }, [customerId]);

  const handleSaveProfile = async () => {
    if (!profile.firstName || !profile.lastName) {
      setPageError('First name and last name are required');
      return;
    }
    setSaving(true);
    setPageError(null);
    try {
      // Update Fineract client if needed
      const fullName = `${profile.firstName} ${profile.lastName}`;
      const result = await registerCustomer({
        email: profile.email,
        name: fullName,
        phone: profile.phone || profile.mpesaNumber,
      });

      // Save to local auth state
      login({
        ...user,
        name: fullName,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth,
        nationalId: profile.nationalId,
        mpesaNumber: profile.mpesaNumber,
        address: profile.address,
        fineractClientId: result.fineractClientId || user.fineractClientId,
        accountNo: result.accountNo || user.accountNo,
      });

      setEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      setPageError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStartVerification = () => {
    navigate('/customer/kyc');
  };

  if (loading) return <LoadingSpinner />;

  const kycStatus = account?.kyc?.status || 'NOT_STARTED';
  const screeningStatus = account?.screening?.result || account?.screening?.status || 'NOT_STARTED';
  const isActive = account?.accountStatus === 'ACTIVE';
  const hasStarted = kycStatus !== 'NOT_STARTED';
  const profileComplete = profile.firstName && profile.lastName && profile.email;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My Account</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage your profile, verification, and compliance status.
      </Typography>

      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      {saveSuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaveSuccess(false)}>Profile saved successfully.</Alert>}

      {/* Profile Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <AccountCircleIcon sx={{ fontSize: 48, color: isActive ? 'success.main' : 'grey.500' }} />
              <Box>
                <Typography variant="h6">
                  {profile.firstName && profile.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : user?.name || 'Customer'}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip
                    label={isActive ? 'Active' : 'Pending Verification'}
                    color={isActive ? 'success' : 'warning'}
                    size="small"
                  />
                  {user?.fineractClientId && (
                    <Chip label={`Account #${user.accountNo || user.fineractClientId}`} size="small" variant="outlined" />
                  )}
                  {!profileComplete && <Chip label="Profile Incomplete" color="error" size="small" variant="outlined" />}
                </Stack>
              </Box>
            </Stack>
            {!editing ? (
              <Button startIcon={<EditIcon />} onClick={() => setEditing(true)} variant="outlined" size="small">
                Edit Profile
              </Button>
            ) : (
              <Stack direction="row" spacing={1}>
                <Button startIcon={<SaveIcon />} onClick={handleSaveProfile} variant="contained" size="small" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
                <IconButton size="small" onClick={() => setEditing(false)}><CloseIcon /></IconButton>
              </Stack>
            )}
          </Stack>

          <Collapse in={editing}>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1.5 }}>Personal Details</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField label="First Name" fullWidth size="small" required
                  value={profile.firstName} onChange={(e) => setProfile(p => ({ ...p, firstName: e.target.value }))}
                  error={editing && !profile.firstName} helperText={editing && !profile.firstName ? 'Required for KYC' : ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Last Name" fullWidth size="small" required
                  value={profile.lastName} onChange={(e) => setProfile(p => ({ ...p, lastName: e.target.value }))}
                  error={editing && !profile.lastName} helperText={editing && !profile.lastName ? 'Required for KYC' : ''}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Email" fullWidth size="small" type="email"
                  value={profile.email} onChange={(e) => setProfile(p => ({ ...p, email: e.target.value }))} disabled
                  helperText="Email cannot be changed"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Date of Birth" fullWidth size="small" type="date" InputLabelProps={{ shrink: true }}
                  value={profile.dateOfBirth} onChange={(e) => setProfile(p => ({ ...p, dateOfBirth: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Phone Number" fullWidth size="small" placeholder="+255 7XX XXX XXX"
                  value={profile.phone} onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="M-Pesa Number" fullWidth size="small" placeholder="+255 7XX XXX XXX"
                  value={profile.mpesaNumber} onChange={(e) => setProfile(p => ({ ...p, mpesaNumber: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="National ID / Passport" fullWidth size="small"
                  value={profile.nationalId} onChange={(e) => setProfile(p => ({ ...p, nationalId: e.target.value }))}
                />
              </Grid>
              <Grid item xs={12}><Typography variant="subtitle2" sx={{ mt: 1 }}>Address</Typography></Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Address Line 1" fullWidth size="small" placeholder="Street address"
                  value={profile.address.addressLine1}
                  onChange={(e) => setProfile(p => ({ ...p, address: { ...p.address, addressLine1: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Address Line 2" fullWidth size="small" placeholder="Apt, Suite, Floor (optional)"
                  value={profile.address.addressLine2}
                  onChange={(e) => setProfile(p => ({ ...p, address: { ...p.address, addressLine2: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="City" fullWidth size="small"
                  value={profile.address.city}
                  onChange={(e) => setProfile(p => ({ ...p, address: { ...p.address, city: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="State / Province" fullWidth size="small"
                  value={profile.address.state}
                  onChange={(e) => setProfile(p => ({ ...p, address: { ...p.address, state: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Postal Code" fullWidth size="small"
                  value={profile.address.postalCode}
                  onChange={(e) => setProfile(p => ({ ...p, address: { ...p.address, postalCode: e.target.value } }))}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Country" fullWidth size="small"
                  value={profile.address.country}
                  onChange={(e) => setProfile(p => ({ ...p, address: { ...p.address, country: e.target.value } }))}
                />
              </Grid>
            </Grid>
          </Collapse>

          {!editing && (
            <>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">First Name</Typography>
                  <Typography variant="body2">{profile.firstName || <Chip label="Missing" size="small" color="error" variant="outlined" />}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Last Name</Typography>
                  <Typography variant="body2">{profile.lastName || <Chip label="Missing" size="small" color="error" variant="outlined" />}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{profile.email || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Phone</Typography>
                  <Typography variant="body2">{profile.phone || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">Date of Birth</Typography>
                  <Typography variant="body2">{profile.dateOfBirth || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">National ID</Typography>
                  <Typography variant="body2">{profile.nationalId || '-'}</Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">M-Pesa Number</Typography>
                  <Typography variant="body2">{profile.mpesaNumber || '-'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Address</Typography>
                  <Typography variant="body2">
                    {[
                      profile.address.addressLine1,
                      profile.address.addressLine2,
                      profile.address.city,
                      profile.address.state,
                      profile.address.postalCode,
                      profile.address.country,
                    ].filter(Boolean).join(', ') || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}

          {isActive && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Your account is fully verified. You have access to all wealth management features.
            </Alert>
          )}

          {!hasStarted && !profileComplete && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Please complete your profile (first name, last name) before starting KYC verification.
            </Alert>
          )}
        </CardContent>
      </Card>

      <Stack spacing={3}>
        {/* KYC Section */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <VerifiedUserIcon color="primary" />
                <Typography variant="h6">KYC Verification</Typography>
              </Stack>
              {getStatusChip(kycStatus)}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Identity verification, address proof, and financial details required for regulatory compliance.
            </Typography>

            {account?.kyc?.steps && (
              <>
                <Divider sx={{ mb: 1 }} />
                <List dense>
                  {account.kyc.steps.map((step, i) => (
                    <ListItem key={i}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {step.status === 'COMPLETED' ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <PendingIcon color="disabled" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={step.name}
                        secondary={step.fields?.join(', ')}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}

            {kycStatus === 'REJECTED' && account?.kyc?.rejectionReason && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Rejection reason: {account.kyc.rejectionReason}
              </Alert>
            )}

            {!hasStarted && (
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                onClick={handleStartVerification}
                sx={{ mt: 2 }}
              >
                Start Verification
              </Button>
            )}
            {!hasStarted && !profileComplete && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                Complete your profile first (click "Edit Profile" above)
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Screening Section */}
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ShieldIcon color="primary" />
                <Typography variant="h6">Compliance Screening</Typography>
              </Stack>
              {getStatusChip(screeningStatus)}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              AML/sanctions and PEP screening for regulatory compliance. This runs automatically after KYC verification.
            </Typography>

            {account?.screening?.checks && (
              <>
                <Divider sx={{ mb: 1 }} />
                <List dense>
                  {Object.entries(account.screening.checks).map(([name, check]) => (
                    <ListItem key={name}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {check.result === 'CLEAR' ? (
                          <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                          <ErrorIcon color="error" fontSize="small" />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={name.charAt(0).toUpperCase() + name.slice(1)}
                        secondary={`Source: ${check.source}`}
                      />
                    </ListItem>
                  ))}
                </List>
                {account.screening.riskScore != null && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Risk Score: {account.screening.riskScore}/100
                  </Typography>
                )}
              </>
            )}

            {screeningStatus === 'FLAGGED' && (
              <Alert severity="warning" sx={{ mt: 1 }}>
                Your screening has been flagged for manual review. Our compliance team will contact you.
              </Alert>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
