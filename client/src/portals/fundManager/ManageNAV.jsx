import { useEffect, useState } from 'react';
import {
  Typography, Box, Button, TextField, Card, CardContent, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper,
  Stack,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { getAllNav, getNavHistory, triggerNavUpdate, getBatchStatus } from '../../api/offersApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';
import { formatCurrency } from '../../utils/formatters';

export default function ManageNAV() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getAllNav);
  const [csvData, setCsvData] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);

  const [historyDialog, setHistoryDialog] = useState({ open: false, fundCode: null, fundName: '' });
  const [historyRows, setHistoryRows] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [batches, setBatches] = useState(null);
  const [batchLoading, setBatchLoading] = useState(true);
  const [batchError, setBatchError] = useState(null);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    setBatchLoading(true);
    getBatchStatus()
      .then((data) => setBatches(data))
      .catch((err) => setBatchError(parseApiError(err)))
      .finally(() => setBatchLoading(false));
  }, []);

  const handleUpload = async () => {
    if (!csvData.trim()) return;
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    try {
      await triggerNavUpdate(csvData, 'CSV');
      setUploadSuccess('NAV data processed successfully.');
      setCsvData('');
      load();
    } catch (err) {
      setUploadError(parseApiError(err));
    } finally {
      setUploading(false);
    }
  };

  const handleRowClick = (row) => {
    setHistoryDialog({ open: true, fundCode: row.fundCode, fundName: row.fundName || row.fundCode });
    setHistoryLoading(true);
    setHistoryRows([]);
    getNavHistory(row.fundCode, 50)
      .then((data) => setHistoryRows(Array.isArray(data) ? data : []))
      .catch(() => setHistoryRows([]))
      .finally(() => setHistoryLoading(false));
  };

  const columns = [
    { field: 'fundCode', headerName: 'Fund Code', width: 140 },
    { field: 'fundName', headerName: 'Fund Name', flex: 1, minWidth: 180 },
    {
      field: 'navValue', headerName: 'NAV Value', width: 150,
      renderCell: (params) => formatCurrency(params.value, params.row.currency || 'KES'),
    },
    { field: 'navDate', headerName: 'NAV Date', width: 140 },
    { field: 'currency', headerName: 'Currency', width: 100 },
    {
      field: 'aum', headerName: 'AUM', width: 160,
      renderCell: (params) => params.value != null ? formatCurrency(params.value, params.row.currency || 'KES') : '-',
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>NAV Management</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}

      {/* Manual NAV Upload */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Manual NAV Upload</Typography>
          {uploadError && <ErrorAlert error={uploadError} onClose={() => setUploadError(null)} />}
          {uploadSuccess && (
            <Box sx={{ mb: 2, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1 }}>
              <Typography variant="body2" color="success.main">{uploadSuccess}</Typography>
            </Box>
          )}
          <TextField
            multiline
            rows={5}
            fullWidth
            placeholder="Paste CSV data here (e.g. fundCode, navValue, navDate, currency)"
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            size="small"
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleUpload}
            disabled={uploading || !csvData.trim()}
          >
            {uploading ? 'Processing...' : 'Process NAV'}
          </Button>
        </CardContent>
      </Card>

      {/* Latest NAV Values */}
      <Typography variant="h6" gutterBottom>Latest NAV Values</Typography>
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
      />

      {/* Batch Status */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>Batch Status</Typography>
        {batchError && <ErrorAlert error={batchError} onClose={() => setBatchError(null)} />}
        {batchLoading ? (
          <Typography variant="body2" color="text.secondary">Loading batch status...</Typography>
        ) : batches ? (
          <Stack spacing={2}>
            {batches.completedBatches && batches.completedBatches.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Completed Batches</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Batch ID</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Completed At</TableCell>
                          <TableCell>Records</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {batches.completedBatches.map((b, i) => (
                          <TableRow key={b.id || i}>
                            <TableCell>{b.id || b.batchId}</TableCell>
                            <TableCell>
                              <Chip label={b.status || 'COMPLETED'} size="small" color="success" />
                            </TableCell>
                            <TableCell>{b.completedAt || b.timestamp || '-'}</TableCell>
                            <TableCell>{b.recordCount ?? b.records ?? '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
            {batches.scheduledJobs && batches.scheduledJobs.length > 0 && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>Scheduled Jobs</Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Job ID</TableCell>
                          <TableCell>Schedule</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Next Run</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {batches.scheduledJobs.map((j, i) => (
                          <TableRow key={j.id || j.jobId || i}>
                            <TableCell>{j.id || j.jobId}</TableCell>
                            <TableCell>{j.schedule || j.cronExpression || '-'}</TableCell>
                            <TableCell>
                              <Chip label={j.status || 'SCHEDULED'} size="small" color="info" />
                            </TableCell>
                            <TableCell>{j.nextRun || j.nextExecution || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}
            {(!batches.completedBatches || batches.completedBatches.length === 0) &&
             (!batches.scheduledJobs || batches.scheduledJobs.length === 0) && (
              <Typography variant="body2" color="text.secondary">No batch information available.</Typography>
            )}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">No batch information available.</Typography>
        )}
      </Box>

      {/* NAV History Dialog */}
      <Dialog
        open={historyDialog.open}
        onClose={() => setHistoryDialog({ open: false, fundCode: null, fundName: '' })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>NAV History - {historyDialog.fundName}</DialogTitle>
        <DialogContent>
          {historyLoading ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>Loading history...</Typography>
          ) : historyRows.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>No historical data available.</Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">NAV Value</TableCell>
                    <TableCell>Currency</TableCell>
                    <TableCell align="right">AUM</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyRows.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.navDate || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(row.navValue, row.currency || 'KES')}</TableCell>
                      <TableCell>{row.currency || '-'}</TableCell>
                      <TableCell align="right">{row.aum != null ? formatCurrency(row.aum, row.currency || 'KES') : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialog({ open: false, fundCode: null, fundName: '' })}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
