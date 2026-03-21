import { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Card, CardContent, Divider, MenuItem, TextField
} from '@mui/material';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';
import { createCustomerProfile, getCustomer360, searchCustomers, updateLifecycle } from '../../api/orchestrationApi';

const lifecycleColor = (s) => {
  const map = {
    ACTIVE: 'success', ONBOARDING: 'info', SUSPENDED: 'warning',
    CLOSED: 'error', DORMANT: 'default', PROSPECT: 'default',
  };
  return map[s] || 'default';
};

const LIFECYCLE_STATUSES = ['PROSPECT', 'ONBOARDING', 'ACTIVE', 'DORMANT', 'SUSPENDED', 'CLOSED'];

export default function ManageCRM() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(
    searchCustomers,
    (data) => (data.data || data || []).map(c => ({ ...c, id: c.customerId }))
  );
  const [dialog, setDialog] = useState({ open: false });
  const [detailOpen, setDetailOpen] = useState(false);
  const [customer360, setCustomer360] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [lifecycleValue, setLifecycleValue] = useState('');
  const [lifecycleLoading, setLifecycleLoading] = useState(false);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'customerId', headerName: 'Customer ID', flex: 1, minWidth: 280 },
    {
      field: 'name', headerName: 'Name', flex: 1, minWidth: 180,
      valueGetter: (v, row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || row.name || ''
    },
    {
      field: 'lifecycleStatus', headerName: 'Lifecycle', width: 140,
      renderCell: ({ value }) => value ? <Chip label={value} size="small" color={lifecycleColor(value)} /> : null
    },
    { field: 'segment', headerName: 'Segment', width: 120 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'createdAt', headerName: 'Created', width: 180 },
  ];

  const formFields = [
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'lastName', label: 'Last Name', required: true },
    { name: 'email', label: 'Email' },
    { name: 'mobileNo', label: 'Mobile Number' },
    {
      name: 'segment', label: 'Segment', options: [
        { value: 'STANDARD', label: 'Standard' },
        { value: 'PREMIUM', label: 'Premium' },
        { value: 'VIP', label: 'VIP' },
      ], defaultValue: 'STANDARD'
    },
  ];

  const handleSubmit = async (values) => {
    await createCustomerProfile(values);
    load();
  };

  const handleRowClick = async (row) => {
    try {
      setDetailError(null);
      const resp = await getCustomer360(row.customerId);
      const data = resp.data || resp;
      setCustomer360(data);
      setLifecycleValue(data.lifecycleStatus || data.profile?.lifecycleStatus || '');
      setDetailOpen(true);
    } catch (e) {
      setDetailError(parseApiError(e));
    }
  };

  const handleLifecycleUpdate = async () => {
    if (!customer360 || !lifecycleValue) return;
    setLifecycleLoading(true);
    try {
      const custId = customer360.customerId || customer360.profile?.customerId;
      await updateLifecycle(custId, lifecycleValue);
      setDetailOpen(false);
      load();
    } catch (e) {
      setDetailError(parseApiError(e));
    } finally {
      setLifecycleLoading(false);
    }
  };

  const profile = customer360?.profile || customer360 || {};

  return (
    <Box>
      <Typography variant="h5" gutterBottom>CRM - Customer Management</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      {detailError && <ErrorAlert error={detailError} onClose={() => setDetailError(null)} />}

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onAdd={() => setDialog({ open: true })}
        addLabel="New Customer"
        onRowClick={handleRowClick}
      />

      <FormDialog
        open={dialog.open}
        title="Create Customer Profile"
        fields={formFields}
        onSubmit={handleSubmit}
        onClose={() => setDialog({ open: false })}
      />

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Customer 360</DialogTitle>
        <DialogContent>
          {customer360 && (
            <Box sx={{ mt: 2 }}>
              {/* Personal Info */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Personal Information</Typography>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography>{profile.firstName} {profile.lastName}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Email</Typography>
                      <Typography>{profile.email || '-'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Mobile</Typography>
                      <Typography>{profile.mobileNo || '-'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Segment</Typography>
                      <Typography>{profile.segment || '-'}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Lifecycle Status</Typography>
                      <Chip label={profile.lifecycleStatus || '-'} size="small" color={lifecycleColor(profile.lifecycleStatus)} />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Created</Typography>
                      <Typography>{profile.createdAt || '-'}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* KYC Status */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>KYC Status</Typography>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">KYC Verification</Typography>
                    <Chip
                      label={customer360.kycStatus || customer360.kyc?.status || 'UNKNOWN'}
                      size="small"
                      color={
                        (customer360.kycStatus || customer360.kyc?.status) === 'VERIFIED' ? 'success'
                          : (customer360.kycStatus || customer360.kyc?.status) === 'REJECTED' ? 'error'
                            : 'warning'
                      }
                    />
                  </Box>
                </CardContent>
              </Card>

              {/* Screening Result */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Screening Result</Typography>
              <Card variant="outlined" sx={{ mb: 2 }}>
                <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">Screening</Typography>
                    <Chip
                      label={customer360.screeningResult || customer360.screening?.result || 'NOT SCREENED'}
                      size="small"
                      color={
                        (customer360.screeningResult || customer360.screening?.result) === 'PASS' ? 'success'
                          : (customer360.screeningResult || customer360.screening?.result) === 'FLAGGED' ? 'error'
                            : 'default'
                      }
                    />
                  </Box>
                  {(customer360.screening?.riskScore !== undefined) && (
                    <Typography variant="caption" color="text.secondary">
                      Risk Score: {customer360.screening.riskScore}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Fineract Data */}
              {(customer360.fineract || customer360.fineractId) && (
                <>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Fineract Data</Typography>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Fineract Client ID</Typography>
                          <Typography>{customer360.fineractId || customer360.fineract?.clientId || '-'}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">Account Number</Typography>
                          <Typography>{customer360.fineract?.accountNo || '-'}</Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Lifecycle Update */}
              <Typography variant="subtitle2" sx={{ mb: 1 }}>Update Lifecycle Status</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  select
                  size="small"
                  label="Lifecycle Status"
                  value={lifecycleValue}
                  onChange={(e) => setLifecycleValue(e.target.value)}
                  sx={{ width: 200 }}
                >
                  {LIFECYCLE_STATUSES.map(s => (
                    <MenuItem key={s} value={s}>{s}</MenuItem>
                  ))}
                </TextField>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleLifecycleUpdate}
                  disabled={lifecycleLoading}
                >
                  {lifecycleLoading ? 'Updating...' : 'Update'}
                </Button>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
