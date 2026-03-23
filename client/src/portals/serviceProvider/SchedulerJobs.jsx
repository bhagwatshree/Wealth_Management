import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getSchedulerJobs, runSchedulerJob } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

export default function SchedulerJobs() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getSchedulerJobs()
      .then(data => setRows(data.map(r => ({ id: r.jobId, ...r }))))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRun = async (jobId) => {
    try { await runSchedulerJob(jobId); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'jobId', headerName: 'Job ID', width: 80 },
    { field: 'displayName', headerName: 'Name', flex: 1 },
    { field: 'cronExpression', headerName: 'Cron Expression', width: 180 },
    { field: 'lastRunStartTime', headerName: 'Last Run Start', width: 180, valueGetter: (v, row) => row.lastRunHistory?.jobRunStartTime || '' },
    { field: 'lastRunStatus', headerName: 'Last Run Status', width: 140, valueGetter: (v, row) => row.lastRunHistory?.status || '' },
    { field: 'nextRunTime', headerName: 'Next Run', width: 180 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleRun(params.row.jobId); }}><PlayArrowIcon fontSize="small" /></IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Scheduler Jobs</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
}
