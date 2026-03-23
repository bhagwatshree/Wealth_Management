import { useEffect, useState, useCallback } from 'react';
import {
  Typography, Box, Chip, Stack, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, Alert, Card, CardContent,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getAllApplications, reviewApplication, getApplicationStats } from '../../api/orchestrationApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { parseApiError } from '../../utils/errorHelper';

import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const statusColor = { PENDING: 'warning', KYC_REQUIRED: 'info', PAYMENT_REQUIRED: 'secondary', APPROVED: 'success', REJECTED: 'error' };
const typeLabels = { SAVINGS_ACCOUNT: 'Savings Account', LOAN: 'Loan', WEALTH_PRODUCT: 'Wealth Product' };

export default function ApplicationManagement() {
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [reviewDialog, setReviewDialog] = useState({ open: false, app: null });
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (filterStatus) params.status = filterStatus;
    Promise.all([getAllApplications(params), getApplicationStats()])
      .then(([apps, s]) => { setApplications(apps); setStats(s); })
      .catch((e) => setError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const handleReview = async (status) => {
    setSubmitting(true);
    try {
      await reviewApplication(reviewDialog.app.id, {
        status,
        reviewedBy: 'admin',
        reviewNotes,
      });
      setReviewDialog({ open: false, app: null });
      setReviewNotes('');
      load();
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { field: 'customerName', headerName: 'Customer', flex: 1, minWidth: 140 },
    { field: 'customerEmail', headerName: 'Email', width: 180 },
    { field: 'productName', headerName: 'Product', flex: 1, minWidth: 160 },
    {
      field: 'type', headerName: 'Type', width: 140,
      renderCell: (p) => typeLabels[p.value] || p.value,
    },
    {
      field: 'amount', headerName: 'Amount', width: 120,
      renderCell: (p) => p.value ? Number(p.value).toLocaleString() : '-',
    },
    {
      field: 'status', headerName: 'Status', width: 130,
      renderCell: (p) => {
        const label = { KYC_REQUIRED: 'KYC Required', PAYMENT_REQUIRED: 'Awaiting Payment' }[p.value] || p.value;
        return <Chip label={label} size="small" color={statusColor[p.value] || 'default'} />;
      },
    },
    {
      field: 'submittedAt', headerName: 'Submitted', width: 170,
      renderCell: (p) => new Date(p.value).toLocaleString(),
    },
    {
      field: 'provisioningStatus', headerName: 'Fineract', width: 110,
      renderCell: (p) => {
        if (p.row.status !== 'APPROVED') return '-';
        if (p.value === 'SUCCESS') return <Chip label="Provisioned" size="small" color="success" variant="outlined" />;
        if (p.value === 'FAILED') return <Chip label="Failed" size="small" color="error" variant="outlined" />;
        return <Chip label="Pending" size="small" color="default" variant="outlined" />;
      },
    },
    {
      field: 'kycComplete', headerName: 'KYC', width: 80,
      renderCell: (p) => <Chip label={p.value ? 'Done' : 'No'} size="small" color={p.value ? 'success' : 'default'} variant="outlined" />,
    },
    {
      field: 'actions', headerName: 'Action', width: 100,
      renderCell: (p) => ['PENDING', 'KYC_REQUIRED'].includes(p.row.status) ? (
        <Button size="small" variant="outlined" onClick={(e) => { e.stopPropagation(); setReviewDialog({ open: true, app: p.row }); }}>
          Review
        </Button>
      ) : '-',
    },
  ];

  if (loading) return <LoadingSpinner />;

  const app = reviewDialog.app;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Application Management</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review and approve customer product applications.
      </Typography>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      {stats && (
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <Card sx={{ minWidth: 100, cursor: 'pointer', border: filterStatus === '' ? 2 : 0, borderColor: 'primary.main' }} onClick={() => setFilterStatus('')}>
            <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h5">{stats.total}</Typography>
              <Typography variant="caption" color="text.secondary">Total</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 100, cursor: 'pointer', border: filterStatus === 'PENDING' ? 2 : 0, borderColor: 'warning.main' }} onClick={() => setFilterStatus('PENDING')}>
            <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h5" color="warning.main">{stats.pending}</Typography>
              <Typography variant="caption" color="text.secondary">Pending</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 100, cursor: 'pointer', border: filterStatus === 'KYC_REQUIRED' ? 2 : 0, borderColor: 'info.main' }} onClick={() => setFilterStatus('KYC_REQUIRED')}>
            <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h5" color="info.main">{stats.kycRequired || 0}</Typography>
              <Typography variant="caption" color="text.secondary">KYC Required</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 100, cursor: 'pointer', border: filterStatus === 'PAYMENT_REQUIRED' ? 2 : 0, borderColor: 'secondary.main' }} onClick={() => setFilterStatus('PAYMENT_REQUIRED')}>
            <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h5" color="secondary.main">{stats.paymentRequired || 0}</Typography>
              <Typography variant="caption" color="text.secondary">Awaiting Payment</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 100, cursor: 'pointer', border: filterStatus === 'APPROVED' ? 2 : 0, borderColor: 'success.main' }} onClick={() => setFilterStatus('APPROVED')}>
            <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h5" color="success.main">{stats.approved}</Typography>
              <Typography variant="caption" color="text.secondary">Approved</Typography>
            </CardContent>
          </Card>
          <Card sx={{ minWidth: 100, cursor: 'pointer', border: filterStatus === 'REJECTED' ? 2 : 0, borderColor: 'error.main' }} onClick={() => setFilterStatus('REJECTED')}>
            <CardContent sx={{ textAlign: 'center', py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Typography variant="h5" color="error.main">{stats.rejected}</Typography>
              <Typography variant="caption" color="text.secondary">Rejected</Typography>
            </CardContent>
          </Card>
        </Stack>
      )}

      <DataTable rows={applications} columns={columns} />

      {/* Review Dialog */}
      <Dialog open={reviewDialog.open} onClose={() => setReviewDialog({ open: false, app: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Review Application</DialogTitle>
        <DialogContent>
          {app && (
            <Box sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Customer</Typography>
                  <Typography variant="body2">{app.customerName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Email</Typography>
                  <Typography variant="body2">{app.customerEmail || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Product</Typography>
                  <Typography variant="body2">{app.productName}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Type</Typography>
                  <Typography variant="body2">{typeLabels[app.type] || app.type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Amount</Typography>
                  <Typography variant="body2">{app.amount ? Number(app.amount).toLocaleString() : '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">Submitted</Typography>
                  <Typography variant="body2">{new Date(app.submittedAt).toLocaleString()}</Typography>
                </Grid>
                {app.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Customer Notes</Typography>
                    <Typography variant="body2">{app.notes}</Typography>
                  </Grid>
                )}
              </Grid>

              {app.paidAmount && (
                <Alert severity="success" sx={{ mt: 2 }} variant="outlined">
                  Payment Received: {Number(app.paidAmount).toLocaleString()} TZS on {new Date(app.paidAt).toLocaleString()}
                </Alert>
              )}
              {app.fineractResourceId && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Fineract Account Created — Resource ID: {app.fineractResourceId}, Client ID: {app.fineractClientId}
                </Alert>
              )}
              {app.provisioningError && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Provisioning Error: {app.provisioningError}
                </Alert>
              )}
              {app.kycComplete ? (
                <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
                  KYC is complete. Approving will move this to "Awaiting Payment" — the customer must pay before provisioning.
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  KYC is NOT complete. You cannot approve until the customer completes KYC.
                  Use "Request KYC" to notify the customer.
                </Alert>
              )}

              <TextField
                label="Review Notes"
                fullWidth
                multiline
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes about this decision..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialog({ open: false, app: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<CancelIcon />}
            onClick={() => handleReview('REJECTED')}
            disabled={submitting}
          >
            Reject
          </Button>
          {!app?.kycComplete && (
            <Button
              variant="contained"
              color="info"
              startIcon={<WarningAmberIcon />}
              onClick={() => handleReview('KYC_REQUIRED')}
              disabled={submitting}
            >
              Request KYC
            </Button>
          )}
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={() => handleReview('APPROVED')}
            disabled={submitting || !app?.kycComplete}
          >
            Approve
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
