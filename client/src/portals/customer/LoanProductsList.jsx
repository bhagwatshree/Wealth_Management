import { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getLoanProducts } from '../../api/customerApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { formatCurrency } from '../../utils/formatters';

const columns = [
  { field: 'name', headerName: 'Product Name', flex: 1 },
  { field: 'shortName', headerName: 'Short Name', width: 120 },
  { field: 'fundName', headerName: 'Fund', flex: 1 },
  { field: 'minPrincipal', headerName: 'Min Principal', width: 140, valueFormatter: (v) => formatCurrency(v) },
  { field: 'maxPrincipal', headerName: 'Max Principal', width: 140, valueFormatter: (v) => formatCurrency(v) },
  { field: 'interestRatePerPeriod', headerName: 'Interest Rate %', width: 130 },
];

export default function LoanProductsList() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getLoanProducts);
  const navigate = useNavigate();

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Loan Products</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={(row) => navigate(`/customer/product/loan/${row.id}`)}
      />
    </Box>
  );
}
