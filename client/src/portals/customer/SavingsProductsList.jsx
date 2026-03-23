import { useEffect, useState } from 'react';
import { Typography, Box, Button, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SendIcon from '@mui/icons-material/Send';
import { getSavingsProducts } from '../../api/customerApi';
import { submitApplication } from '../../api/orchestrationApi';
import { useAuth } from '../../hooks/useAuth';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';

export default function SavingsProductsList() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getSavingsProducts);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState(null);

  useEffect(() => { load(); }, [load]);

  const handleQuickApply = async (e, row) => {
    e.stopPropagation();
    try {
      await submitApplication({
        customerId: user?.email || user?.name,
        customerName: user?.name,
        customerEmail: user?.email,
        type: 'SAVINGS_ACCOUNT',
        productId: row.id,
        productName: row.name,
      });
      setApplySuccess(true);
    } catch (err) {
      setApplyError(parseApiError(err));
    }
  };

  const columns = [
    { field: 'name', headerName: 'Product Name', flex: 1 },
    { field: 'shortName', headerName: 'Short Name', width: 120 },
    { field: 'nominalAnnualInterestRate', headerName: 'Annual Interest %', width: 160 },
    { field: 'currencyCode', headerName: 'Currency', width: 100, valueGetter: (v, row) => row.currency?.code || '' },
    {
      field: 'apply', headerName: 'Apply', width: 140,
      renderCell: (params) => (
        <Button size="small" variant="outlined" startIcon={<SendIcon />} onClick={(e) => handleQuickApply(e, params.row)}>
          Open Account
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Savings Products</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Browse savings products and apply directly. No KYC required to apply.
      </Typography>
      {applySuccess && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setApplySuccess(false)}>Application submitted! Track it under "My Applications".</Alert>}
      {applyError && <ErrorAlert error={applyError} onClose={() => setApplyError(null)} />}
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
