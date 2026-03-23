import { useEffect, useState } from 'react';
import {
  Typography, Box, Chip, Stack, Card, CardContent, Grid,
  ToggleButtonGroup, ToggleButton,
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useAuth } from '../../hooks/useAuth';
import { getMyTransactions, getMyBalance } from '../../api/orchestrationApi';
import DataTable from '../../components/DataTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const typeLabels = {
  PAYMENT: 'Payment',
  DEPOSIT: 'Deposit',
  WITHDRAWAL: 'Withdrawal',
  INTEREST_CREDIT: 'Interest Credit',
  INTEREST_DEBIT: 'Interest Debit',
  FEE: 'Fee',
  REFUND: 'Refund',
  TRANSFER: 'Transfer',
};

const typeColor = {
  PAYMENT: 'primary',
  DEPOSIT: 'success',
  WITHDRAWAL: 'error',
  INTEREST_CREDIT: 'success',
  INTEREST_DEBIT: 'error',
  FEE: 'warning',
  REFUND: 'info',
  TRANSFER: 'default',
};

const isCredit = (type) => ['PAYMENT', 'DEPOSIT', 'INTEREST_CREDIT', 'REFUND'].includes(type);

const columns = [
  {
    field: 'createdAt', headerName: 'Date', width: 170,
    renderCell: (p) => new Date(p.value).toLocaleString(),
  },
  { field: 'reference', headerName: 'Reference', width: 150 },
  {
    field: 'type', headerName: 'Type', width: 140,
    renderCell: (p) => <Chip label={typeLabels[p.value] || p.value} size="small" color={typeColor[p.value] || 'default'} />,
  },
  { field: 'description', headerName: 'Description', flex: 1, minWidth: 200 },
  { field: 'productName', headerName: 'Product', width: 160 },
  {
    field: 'amount', headerName: 'Amount', width: 140,
    renderCell: (p) => {
      const credit = isCredit(p.row.type);
      return (
        <Stack direction="row" alignItems="center" spacing={0.5}>
          {credit
            ? <ArrowDownwardIcon sx={{ fontSize: 16, color: 'success.main' }} />
            : <ArrowUpwardIcon sx={{ fontSize: 16, color: 'error.main' }} />
          }
          <Typography variant="body2" sx={{ color: credit ? 'success.main' : 'error.main', fontWeight: 600 }}>
            {credit ? '+' : '-'}{Number(p.value).toLocaleString()} {p.row.currency}
          </Typography>
        </Stack>
      );
    },
  },
  {
    field: 'balanceAfter', headerName: 'Balance', width: 140,
    renderCell: (p) => p.value != null ? `${Number(p.value).toLocaleString()} ${p.row.currency}` : '-',
  },
  {
    field: 'status', headerName: 'Status', width: 100,
    renderCell: (p) => <Chip label={p.value} size="small" color={p.value === 'SUCCESS' ? 'success' : 'default'} variant="outlined" />,
  },
];

export default function TransactionHistory() {
  const { user } = useAuth();
  const [data, setData] = useState({ transactions: [], total: 0 });
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const customerId = user?.email || user?.name;

  useEffect(() => {
    if (!customerId) return;
    setLoading(true);
    const params = {};
    if (filter !== 'ALL') params.type = filter;
    Promise.all([
      getMyTransactions(customerId, params),
      getMyBalance(customerId),
    ])
      .then(([txns, bal]) => { setData(txns); setBalance(bal); })
      .catch((e) => setError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, [customerId, filter]);

  if (loading) return <LoadingSpinner />;

  const totalCredits = data.transactions
    .filter((t) => isCredit(t.type))
    .reduce((s, t) => s + t.amount, 0);
  const totalDebits = data.transactions
    .filter((t) => !isCredit(t.type))
    .reduce((s, t) => s + t.amount, 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Transaction History</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Complete history of all your transactions including payments, interest, and fees.
      </Typography>

      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 36, color: '#E60000' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Current Balance</Typography>
                <Typography variant="h5" fontWeight={700}>
                  {balance ? `${balance.balance.toLocaleString()} TZS` : '-'}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <ArrowDownwardIcon sx={{ fontSize: 36, color: 'success.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Total Credits</Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  +{totalCredits.toLocaleString()} TZS
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <ArrowUpwardIcon sx={{ fontSize: 36, color: 'error.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Total Debits</Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  -{totalDebits.toLocaleString()} TZS
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, v) => v && setFilter(v)}
        size="small"
        sx={{ mb: 2 }}
      >
        <ToggleButton value="ALL">All</ToggleButton>
        <ToggleButton value="PAYMENT">Payments</ToggleButton>
        <ToggleButton value="INTEREST_CREDIT">Interest Credit</ToggleButton>
        <ToggleButton value="INTEREST_DEBIT">Interest Debit</ToggleButton>
        <ToggleButton value="FEE">Fees</ToggleButton>
      </ToggleButtonGroup>

      {data.transactions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary">No Transactions Yet</Typography>
            <Typography variant="body2" color="text.secondary">
              Your transaction history will appear here once you make payments or earn interest.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <DataTable rows={data.transactions} columns={columns} />
      )}
    </Box>
  );
}
