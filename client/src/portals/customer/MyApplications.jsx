import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography, Box, Chip, Stack, Card, CardContent, Alert, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import { useAuth } from '../../hooks/useAuth';
import { getMyApplications, makePayment } from '../../api/orchestrationApi';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const statusColor = {
  PENDING: 'warning',
  KYC_REQUIRED: 'info',
  PAYMENT_REQUIRED: 'secondary',
  APPROVED: 'success',
  REJECTED: 'error',
};

const statusLabels = {
  PENDING: 'Pending',
  KYC_REQUIRED: 'KYC Required',
  PAYMENT_REQUIRED: 'Payment Required',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const typeLabels = {
  SAVINGS_ACCOUNT: 'Savings Account',
  LOAN: 'Loan',
  WEALTH_PRODUCT: 'Wealth Product',
};

export default function MyApplications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payDialog, setPayDialog] = useState({ open: false, app: null });
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('MPESA');
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  const customerId = user?.email || user?.name;

  const loadApps = () => {
    if (!customerId) return;
    setLoading(true);
    getMyApplications(customerId)
      .then(setApplications)
      .catch((e) => setError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadApps(); }, [customerId]);

  const handlePay = async () => {
    setPaying(true);
    try {
      await makePayment({
        customerId,
        customerName: user?.name,
        applicationId: payDialog.app.id,
        amount: Number(payAmount),
        currency: 'TZS',
        paymentMethod: payMethod === 'MPESA' ? 'M-Pesa' : payMethod === 'BANK' ? 'Bank Transfer' : 'Card',
      });
      setPayDialog({ open: false, app: null });
      setPayAmount('');
      setPaySuccess(true);
      loadApps();
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setPaying(false);
    }
  };

  const openPayDialog = (e, app) => {
    e.stopPropagation();
    setPayAmount(app.amount || '');
    setPayDialog({ open: true, app });
  };

  const columns = [
    { field: 'productName', headerName: 'Product', flex: 1, minWidth: 180 },
    {
      field: 'type', headerName: 'Type', width: 140,
      renderCell: (p) => typeLabels[p.value] || p.value,
    },
    {
      field: 'amount', headerName: 'Amount', width: 130,
      renderCell: (p) => p.value ? `${Number(p.value).toLocaleString()} TZS` : '-',
    },
    {
      field: 'status', headerName: 'Status', width: 150,
      renderCell: (p) => (
        <Chip label={statusLabels[p.value] || p.value} size="small" color={statusColor[p.value] || 'default'} />
      ),
    },
    {
      field: 'submittedAt', headerName: 'Submitted', width: 170,
      renderCell: (p) => new Date(p.value).toLocaleString(),
    },
    {
      field: 'fineractResourceId', headerName: 'Account ID', width: 110,
      renderCell: (p) => p.value ? `#${p.value}` : '-',
    },
    {
      field: 'actions', headerName: 'Action', width: 140,
      renderCell: (p) => p.row.status === 'PAYMENT_REQUIRED' ? (
        <Button size="small" variant="contained" color="secondary" startIcon={<PaymentIcon />}
          onClick={(e) => openPayDialog(e, p.row)}>
          Pay Now
        </Button>
      ) : '-',
    },
  ];

  if (loading) return <LoadingSpinner />;

  const pending = applications.filter((a) => a.status === 'PENDING').length;
  const kycRequired = applications.filter((a) => a.status === 'KYC_REQUIRED').length;
  const paymentRequired = applications.filter((a) => a.status === 'PAYMENT_REQUIRED').length;
  const approved = applications.filter((a) => a.status === 'APPROVED').length;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My Applications</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track the status of your product applications and account requests.
      </Typography>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}
      {paySuccess && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setPaySuccess(false)}>
          Payment successful! Your product is now being provisioned.
        </Alert>
      )}

      {kycRequired > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} action={
          <Button color="inherit" size="small" onClick={() => navigate('/customer/my-account')}>
            Complete KYC
          </Button>
        }>
          {kycRequired} application{kycRequired > 1 ? 's require' : ' requires'} KYC verification.
        </Alert>
      )}

      {paymentRequired > 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {paymentRequired} application{paymentRequired > 1 ? 's require' : ' requires'} payment. Click "Pay Now" to proceed.
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>No Applications Yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Browse our savings, loan, or wealth products and apply to get started.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Stack direction="row" spacing={1.5} sx={{ mb: 2 }} flexWrap="wrap">
            <Chip label={`${pending} Pending`} color="warning" variant="outlined" />
            {kycRequired > 0 && <Chip label={`${kycRequired} KYC Required`} color="info" variant="outlined" />}
            {paymentRequired > 0 && <Chip label={`${paymentRequired} Payment Required`} color="secondary" variant="outlined" />}
            <Chip label={`${approved} Approved`} color="success" variant="outlined" />
            <Chip label={`${applications.length} Total`} variant="outlined" />
          </Stack>
          <DataTable rows={applications} columns={columns} />
        </>
      )}

      {/* Payment Dialog */}
      <Dialog open={payDialog.open} onClose={() => setPayDialog({ open: false, app: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Make Payment</DialogTitle>
        <DialogContent>
          {payDialog.app && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Product: <strong>{payDialog.app.productName}</strong>
              </Typography>

              <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
                Your KYC is verified. Complete payment to activate your product.
              </Alert>

              <TextField
                label="Payment Amount (TZS)"
                type="number"
                fullWidth
                size="small"
                sx={{ mb: 2 }}
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
              />

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Payment Method</Typography>
              <ToggleButtonGroup
                value={payMethod}
                exclusive
                onChange={(_, v) => v && setPayMethod(v)}
                fullWidth
                sx={{ mb: 2 }}
              >
                <ToggleButton value="MPESA" sx={{ flexDirection: 'column', py: 1.5 }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                    <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.6rem' }}>M</Typography>
                  </Box>
                  <Typography variant="caption">M-Pesa</Typography>
                </ToggleButton>
                <ToggleButton value="BANK" sx={{ flexDirection: 'column', py: 1.5 }}>
                  <Typography variant="caption">Bank Transfer</Typography>
                </ToggleButton>
                <ToggleButton value="CARD" sx={{ flexDirection: 'column', py: 1.5 }}>
                  <Typography variant="caption">Card</Typography>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialog({ open: false, app: null })}>Cancel</Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PaymentIcon />}
            onClick={handlePay}
            disabled={paying || !payAmount || Number(payAmount) <= 0}
          >
            {paying ? 'Processing...' : `Pay ${payAmount ? Number(payAmount).toLocaleString() + ' TZS' : ''}`}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
