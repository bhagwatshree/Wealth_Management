import { useState, useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getReports } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';

export default function Reports() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getReports);
  const navigate = useNavigate();

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'reportName', headerName: 'Report Name', flex: 1 },
    { field: 'reportType', headerName: 'Type', width: 120 },
    { field: 'reportCategory', headerName: 'Category', width: 150 },
    { field: 'reportSubType', headerName: 'Sub Type', width: 120 },
    { field: 'coreReport', headerName: 'Core', width: 80, valueGetter: (v, row) => row.coreReport ? 'Yes' : 'No' },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Reports</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={(row) => navigate(`/service-provider/reports/${encodeURIComponent(row.reportName)}`)}
      />
    </Box>
  );
}
