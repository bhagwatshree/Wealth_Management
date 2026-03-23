import { useEffect, useState, useCallback } from 'react';
import {
  Typography, Box, Chip, Stack, Card, CardContent, Grid, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  ToggleButtonGroup, ToggleButton, Divider,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { getAllTransactions, getLedgerSummary, postInterest } from '../../api/orchestrationApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { parseApiError } from '../../utils/errorHelper';

const typeLabels = {
  PAYMENT: 'Payment', DEPOSIT: 'Deposit', WITHDRAWAL: 'Withdrawal',
  INTEREST_CREDIT: 'Interest Credit', INTEREST_DEBIT: 'Interest Debit',
  FEE: 'Fee', REFUND: 'Refund', TRANSFER: 'Transfer',
};
const typeColor = {
  PAYMENT: 'primary', DEPOSIT: 'success', WITHDRAWAL: 'error',
  INTEREST_CREDIT: 'success', INTEREST_DEBIT: 'error',
  FEE: 'warning', REFUND: 'info', TRANSFER: 'default',
};
const isCredit = (type) => ['PAYMENT', 'DEPOSIT', 'INTEREST_CREDIT', 'REFUND'].includes(type);

export default function LedgerTransactions() {
  const [data, setData] = useState({ transactions: [], total: 0 });
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [interestDialog, setInterestDialog] = useState(false);
  const [interestForm, setInterestForm] = useState({ customerId: '', customerName: '', accountId: '', amount: '', type: 'CREDIT' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (filter !== 'ALL') params.type = filter;
    Promise.all([getAllTransactions(params), getLedgerSummary()])
      .then(([txns, s]) => { setData(txns); setSummary(s); })
      .catch((e) => setError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handlePostInterest = async () => {
    setSubmitting(true);
    try {
      await postInterest({
        customerId: interestForm.customerId,
        customerName: interestForm.customerName,
        accountId: interestForm.accountId || null,
        amount: Number(interestForm.amount),
        type: interestForm.type,
      });
      setInterestDialog(false);
      setInterestForm({ customerId: '', customerName: '', accountId: '', amount: '', type: 'CREDIT' });
      load();
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      field: 'createdAt', headerName: 'Date', width: 170,
      renderCell: (p) => new Date(p.value).toLocaleString(),
    },
    { field: 'reference', headerName: 'Reference', width: 140 },
    { field: 'customerName', headerName: 'Customer', width: 150 },
    {
      field: 'type', headerName: 'Type', width: 140,
      renderCell: (p) => <Chip label={typeLabels[p.value] || p.value} size="small" color={typeColor[p.value] || 'default'} />,
    },
    { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
    { field: 'productName', headerName: 'Product', width: 150 },
    {
      field: 'debitAccount', headerName: 'Debit', width: 150,
      renderCell: (p) => p.value || '-',
    },
    {
      field: 'creditAccount', headerName: 'Credit', width: 150,
      renderCell: (p) => p.value || '-',
    },
    {
      field: 'amount', headerName: 'Amount', width: 140,
      renderCell: (p) => {
        const credit = isCredit(p.row.type);
        return (
          <Typography variant="body2" sx={{ color: credit ? 'success.main' : 'error.main', fontWeight: 600 }}>
            {credit ? '+' : '-'}{Number(p.value).toLocaleString()} {p.row.currency}
          </Typography>
        );
      },
    },
    {
      field: 'status', headerName: 'Status', width: 90,
      renderCell: (p) => <Chip label={p.value} size="small" color={p.value === 'SUCCESS' ? 'success' : 'default'} variant="outlined" />,
    },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h5">Ledger & Transactions</Typography>
        <Button variant="contained" size="small" onClick={() => setInterestDialog(true)}>
          Post Interest
        </Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Platform-wide transaction ledger. All payments, interest credits/debits, and fees.
      </Typography>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <ReceiptLongIcon sx={{ color: '#E60000', mb: 0.5 }} />
                <Typography variant="h5">{summary.totalTransactions}</Typography>
                <Typography variant="caption" color="text.secondary">Total Transactions</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <ArrowDownwardIcon sx={{ color: 'success.main', mb: 0.5 }} />
                <Typography variant="h5" color="success.main">{summary.totalCredits.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary">Total Credits (TZS)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <ArrowUpwardIcon sx={{ color: 'error.main', mb: 0.5 }} />
                <Typography variant="h5" color="error.main">{summary.totalDebits.toLocaleString()}</Typography>
                <Typography variant="caption" color="text.secondary">Total Debits (TZS)</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <AccountBalanceIcon sx={{ color: '#00695C', mb: 0.5 }} />
                <Typography variant="h5" color={summary.netBalance >= 0 ? 'success.main' : 'error.main'}>
                  {summary.netBalance.toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">Net Balance (TZS)</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      <ToggleButtonGroup value={filter} exclusive onChange={(_, v) => v && setFilter(v)} size="small" sx={{ mb: 2 }}>
        <ToggleButton value="ALL">All</ToggleButton>
        <ToggleButton value="PAYMENT">Payments</ToggleButton>
        <ToggleButton value="INTEREST_CREDIT">Interest Credit</ToggleButton>
        <ToggleButton value="INTEREST_DEBIT">Interest Debit</ToggleButton>
        <ToggleButton value="FEE">Fees</ToggleButton>
        <ToggleButton value="WITHDRAWAL">Withdrawals</ToggleButton>
      </ToggleButtonGroup>

      <DataTable rows={data.transactions} columns={columns} />

      {/* Post Interest Dialog */}
      <Dialog open={interestDialog} onClose={() => setInterestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Post Interest Entry</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <TextField label="Customer ID (email)" fullWidth size="small" sx={{ mb: 2 }}
              value={interestForm.customerId} onChange={(e) => setInterestForm(f => ({ ...f, customerId: e.target.value }))} />
            <TextField label="Customer Name" fullWidth size="small" sx={{ mb: 2 }}
              value={interestForm.customerName} onChange={(e) => setInterestForm(f => ({ ...f, customerName: e.target.value }))} />
            <TextField label="Account ID (optional)" fullWidth size="small" sx={{ mb: 2 }}
              value={interestForm.accountId} onChange={(e) => setInterestForm(f => ({ ...f, accountId: e.target.value }))} />
            <TextField label="Amount (TZS)" type="number" fullWidth size="small" sx={{ mb: 2 }}
              value={interestForm.amount} onChange={(e) => setInterestForm(f => ({ ...f, amount: e.target.value }))} />
            <ToggleButtonGroup value={interestForm.type} exclusive
              onChange={(_, v) => v && setInterestForm(f => ({ ...f, type: v }))} fullWidth>
              <ToggleButton value="CREDIT" color="success">Interest Credit</ToggleButton>
              <ToggleButton value="DEBIT" color="error">Interest Debit</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInterestDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handlePostInterest} disabled={submitting || !interestForm.customerId || !interestForm.amount}>
            {submitting ? 'Posting...' : 'Post Entry'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
