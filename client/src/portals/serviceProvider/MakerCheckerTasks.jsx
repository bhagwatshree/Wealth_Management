import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getMakerCheckerTasks, approveMakerCheckerTask, rejectMakerCheckerTask } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';
import { formatDate } from '../../utils/formatters';

export default function MakerCheckerTasks() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getMakerCheckerTasks({ limit: 100 })
      .then(data => setRows(data.pageItems || data))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    try { await approveMakerCheckerTask(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const handleReject = async (id) => {
    try { await rejectMakerCheckerTask(id); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'actionName', headerName: 'Action', width: 140 },
    { field: 'entityName', headerName: 'Entity', width: 140 },
    { field: 'maker', headerName: 'Maker', flex: 1 },
    { field: 'madeOnDate', headerName: 'Date', width: 120, valueFormatter: (v) => formatDate(v) },
    { field: 'processingResult', headerName: 'Result', width: 100 },
    { field: 'actions', headerName: '', width: 100, sortable: false, renderCell: (params) => (
      <>
        <IconButton size="small" color="success" onClick={(e) => { e.stopPropagation(); handleApprove(params.row.id); }}><CheckCircleIcon fontSize="small" /></IconButton>
        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleReject(params.row.id); }}><CancelIcon fontSize="small" /></IconButton>
      </>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Maker Checker Tasks</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} />
    </Box>
  );
}
