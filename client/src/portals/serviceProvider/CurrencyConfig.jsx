import { useState, useEffect } from 'react';
import { Typography, Box, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, FormControlLabel, Stack } from '@mui/material';
import { getCurrencies, updateCurrencies } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CurrencyConfig() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCodes, setSelectedCodes] = useState([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getCurrencies()
      .then(d => { setData(d); setSelectedCodes((d.selectedCurrencyOptions || []).map(c => c.code)); })
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  if (loading) return <LoadingSpinner />;

  const selected = data?.selectedCurrencyOptions || [];
  const allOptions = data?.currencyOptions || [];

  const columns = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Currency Name', flex: 1 },
    { field: 'displaySymbol', headerName: 'Symbol', width: 80 },
    { field: 'decimalPlaces', headerName: 'Decimals', width: 100 },
  ];

  const rows = selected.map((c, i) => ({ id: i, ...c }));

  const handleToggle = (code) => {
    setSelectedCodes(prev => prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]);
  };

  const handleSave = async () => {
    setSaving(true);
    setPageError(null);
    try {
      await updateCurrencies({ currencies: selectedCodes });
      setDialogOpen(false);
      load();
    } catch (e) {
      setPageError(parseApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Currency Configuration</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Manage active currencies in the system.
      </Typography>
      <DataTable rows={rows} columns={columns} loading={false} onAdd={() => setDialogOpen(true)} addLabel="Manage Currencies" />

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Select Active Currencies</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Check the currencies you want to activate. Uncheck to remove.
          </Typography>
          <Stack sx={{ maxHeight: 400, overflow: 'auto' }}>
            {allOptions.map(c => (
              <FormControlLabel
                key={c.code}
                control={<Checkbox checked={selectedCodes.includes(c.code)} onChange={() => handleToggle(c.code)} />}
                label={`${c.code} — ${c.name} (${c.displaySymbol})`}
              />
            ))}
          </Stack>
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Selected: {selectedCodes.length} currencies
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
