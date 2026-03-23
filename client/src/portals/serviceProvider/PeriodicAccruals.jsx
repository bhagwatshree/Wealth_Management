import { useState } from 'react';
import { Typography, Box, Button, Card, CardContent, TextField, Alert } from '@mui/material';
import api from '../../api/axiosInstance';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { toFineractDate } from '../../utils/formatters';

export default function PeriodicAccruals() {
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRun = async () => {
    setLoading(true);
    setPageError(null);
    setSuccess(false);
    try {
      await api.post('/periodic-accruals', { tillDate: toFineractDate(date), dateFormat: 'dd MMMM yyyy', locale: 'en' });
      setSuccess(true);
    } catch (e) {
      setPageError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Periodic Accruals</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(false)}>Accruals executed successfully.</Alert>}
      <Card>
        <CardContent>
          <Typography variant="body1" gutterBottom>Run periodic accrual accounting for a specific date</Typography>
          <TextField
            type="date"
            label="Accrual Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mr: 2, mb: 2 }}
          />
          <Box>
            <Button variant="contained" onClick={handleRun} disabled={!date || loading}>
              {loading ? 'Running...' : 'Run Accruals'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
