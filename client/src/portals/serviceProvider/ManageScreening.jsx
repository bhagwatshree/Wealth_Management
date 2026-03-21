import { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Card, CardContent, Grid, Stack, LinearProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';
import { screenCustomer, getScreeningResult, getScreeningsByCustomer } from '../../api/orchestrationApi';

const resultColor = (r) =>
  r === 'PASS' || r === 'CLEAR' ? 'success'
    : r === 'FLAGGED' || r === 'FAIL' ? 'error'
      : 'warning';

export default function ManageScreening() {
  const [customerId, setCustomerId] = useState('');
  const { rows, loading, pageError, clearPageError, load, setRows } = usePageData(
    () => customerId ? getScreeningsByCustomer(customerId) : Promise.resolve([]),
    (data) => (data.data || data || []).map((s, i) => ({ ...s, id: s.screeningId || i }))
  );
  const [screenLoading, setScreenLoading] = useState(false);
  const [screenError, setScreenError] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedScreening, setSelectedScreening] = useState(null);
  const [detailError, setDetailError] = useState(null);

  const columns = [
    { field: 'screeningId', headerName: 'Screening ID', flex: 1, minWidth: 280 },
    { field: 'customerId', headerName: 'Customer ID', flex: 1, minWidth: 280 },
    {
      field: 'result', headerName: 'Result', width: 120,
      renderCell: ({ value }) => value ? <Chip label={value} size="small" color={resultColor(value)} /> : null
    },
    {
      field: 'riskScore', headerName: 'Risk Score', width: 120,
      renderCell: ({ value }) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
          <LinearProgress
            variant="determinate"
            value={Math.min(value || 0, 100)}
            color={value > 70 ? 'error' : value > 40 ? 'warning' : 'success'}
            sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
          />
          <Typography variant="caption">{value ?? '-'}</Typography>
        </Box>
      )
    },
    { field: 'screenedAt', headerName: 'Screened At', width: 180 },
  ];

  const handleSearch = () => {
    if (!customerId.trim()) return;
    load();
  };

  const handleScreen = async () => {
    if (!customerId.trim()) return;
    setScreenLoading(true);
    setScreenError(null);
    try {
      await screenCustomer({ customerId: customerId.trim() });
      load();
    } catch (e) {
      setScreenError(parseApiError(e));
    } finally {
      setScreenLoading(false);
    }
  };

  const handleRowClick = async (row) => {
    try {
      setDetailError(null);
      const resp = await getScreeningResult(row.screeningId);
      setSelectedScreening(resp.data || resp);
      setDetailOpen(true);
    } catch (e) {
      setDetailError(parseApiError(e));
    }
  };

  const checkItem = (label, check) => (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" fontWeight={600}>{label}</Typography>
          <Chip
            label={check?.result || check?.status || 'N/A'}
            size="small"
            color={resultColor(check?.result || check?.status)}
          />
        </Box>
        {check?.details && (
          <Typography variant="caption" color="text.secondary">{check.details}</Typography>
        )}
        {check?.matchCount !== undefined && (
          <Typography variant="caption" color="text.secondary" display="block">
            Matches found: {check.matchCount}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Customer Screening</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      {screenError && <ErrorAlert error={screenError} onClose={() => setScreenError(null)} />}
      {detailError && <ErrorAlert error={detailError} onClose={() => setDetailError(null)} />}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          size="small"
          label="Customer ID"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          sx={{ width: 360 }}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button
          variant="outlined"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          disabled={!customerId.trim()}
        >
          Search
        </Button>
        <Button
          variant="contained"
          onClick={handleScreen}
          disabled={!customerId.trim() || screenLoading}
        >
          {screenLoading ? 'Screening...' : 'Run Screening'}
        </Button>
      </Stack>

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
      />

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Screening Details</DialogTitle>
        <DialogContent>
          {selectedScreening && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Screening ID</Typography>
                  <Typography>{selectedScreening.screeningId}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Result</Typography>
                  <Chip label={selectedScreening.result} size="small" color={resultColor(selectedScreening.result)} />
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Risk Score</Typography>
                  <Typography fontWeight={600}>{selectedScreening.riskScore ?? '-'}</Typography>
                </Grid>
              </Grid>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Checks Breakdown</Typography>
              {checkItem('Sanctions', selectedScreening.checks?.sanctions)}
              {checkItem('PEP (Politically Exposed Persons)', selectedScreening.checks?.pep)}
              {checkItem('Adverse Media', selectedScreening.checks?.adverseMedia)}
              {checkItem('Watchlist', selectedScreening.checks?.watchlist)}
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
