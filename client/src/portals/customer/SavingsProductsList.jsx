import { useEffect } from 'react';
import { Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { getSavingsProducts } from '../../api/customerApi';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';

const columns = [
  { field: 'name', headerName: 'Product Name', flex: 1 },
  { field: 'shortName', headerName: 'Short Name', width: 120 },
  { field: 'nominalAnnualInterestRate', headerName: 'Annual Interest %', width: 160 },
  { field: 'currencyCode', headerName: 'Currency', width: 100, valueGetter: (v, row) => row.currency?.code || '' },
];

export default function SavingsProductsList() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getSavingsProducts);
  const navigate = useNavigate();

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Savings Products</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={(row) => navigate(`/customer/product/savings/${row.id}`)}
      />
    </Box>
  );
}
