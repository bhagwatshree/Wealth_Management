import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Box, Button } from '@mui/material';
import { runReport } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { parseApiError } from '../../utils/errorHelper';

export default function ReportRunner() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runReport(name, { R_officeId: 1, R_loanOfficerId: -1 });
      setData(result);
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setLoading(false);
    }
  };

  const columns = data?.columnHeaders?.map((col, i) => ({
    field: `col_${i}`,
    headerName: col.columnName,
    flex: 1,
  })) || [];

  const rows = data?.data?.map((row, i) => {
    const obj = { id: i };
    row.row?.forEach((val, j) => { obj[`col_${j}`] = val; });
    return obj;
  }) || [];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{decodeURIComponent(name)}</Typography>
      <Button variant="contained" onClick={handleRun} sx={{ mb: 3 }}>Run Report</Button>
      {error && <ErrorAlert error={error} onClose={() => setError(null)} />}
      {loading && <LoadingSpinner />}
      {data && !loading && <DataTable rows={rows} columns={columns} loading={false} />}
    </Box>
  );
}
