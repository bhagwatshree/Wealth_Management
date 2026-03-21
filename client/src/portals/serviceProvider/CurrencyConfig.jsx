import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { getCurrencies } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function CurrencyConfig() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    getCurrencies()
      .then(setData)
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const selected = data?.selectedCurrencyOptions || [];
  const columns = [
    { field: 'code', headerName: 'Code', width: 100 },
    { field: 'name', headerName: 'Currency Name', flex: 1 },
    { field: 'displaySymbol', headerName: 'Symbol', width: 80 },
    { field: 'decimalPlaces', headerName: 'Decimals', width: 100 },
  ];

  const rows = selected.map((c, i) => ({ id: i, ...c }));

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Currency Configuration</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Active currencies in the system
      </Typography>
      <DataTable rows={rows} columns={columns} loading={false} />
    </Box>
  );
}
