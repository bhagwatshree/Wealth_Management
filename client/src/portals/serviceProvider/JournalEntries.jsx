import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { getJournalEntries } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function JournalEntries() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const load = (params) => {
    setLoading(true);
    setPageError(null);
    getJournalEntries({ limit: 100, ...params })
      .then(data => setRows(data.pageItems || data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(() => load(), []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'officeName', headerName: 'Office', flex: 1 },
    { field: 'glAccountName', headerName: 'GL Account', flex: 1 },
    { field: 'glAccountCode', headerName: 'Code', width: 100 },
    { field: 'entryType', headerName: 'Type', width: 100, valueGetter: (v, row) => row.entryType?.value || '' },
    { field: 'amount', headerName: 'Amount', width: 130, valueFormatter: (v) => formatCurrency(v) },
    { field: 'transactionDate', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v) },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Journal Entries</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
}
