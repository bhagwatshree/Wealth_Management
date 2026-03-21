import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { getAudits } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate } from '../../utils/formatters';

export default function AuditTrail() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  useEffect(() => {
    getAudits({ limit: 100, orderBy: 'id', sortOrder: 'DESC' })
      .then(data => setRows(data.pageItems || data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'actionName', headerName: 'Action', width: 140 },
    { field: 'entityName', headerName: 'Entity', width: 140 },
    { field: 'resourceId', headerName: 'Resource ID', width: 110 },
    { field: 'maker', headerName: 'Made By', flex: 1 },
    { field: 'madeOnDate', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v) },
    { field: 'processingResult', headerName: 'Result', width: 100 },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Audit Trail</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
}
