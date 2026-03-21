import { useEffect, useState } from 'react';
import { Typography, Box, Chip, IconButton } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getProducts, createProduct, updateProduct } from '../../api/offersApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { formatCurrency } from '../../utils/formatters';

const CATEGORIES = [
  { value: 'EQUITIES', label: 'Equities' },
  { value: 'FIXED_INCOME', label: 'Fixed Income' },
  { value: 'SAVINGS', label: 'Savings' },
  { value: 'DIGITAL_ASSETS', label: 'Digital Assets' },
  { value: 'ALTERNATIVE_INVESTMENTS', label: 'Alternative Investments' },
  { value: 'INVESTMENT_FUNDS', label: 'Investment Funds' },
  { value: 'TAX_EFFICIENT', label: 'Tax Efficient' },
  { value: 'FOREX', label: 'Forex' },
  { value: 'STRUCTURED_EMBEDDED', label: 'Structured & Embedded' },
];

const TYPES = [
  { value: 'MONEY_MARKET_FUND', label: 'Money Market Fund' },
  { value: 'TREASURY_BONDS', label: 'Treasury Bonds' },
  { value: 'TREASURY_BILLS', label: 'Treasury Bills' },
  { value: 'STOCK_TRADING', label: 'Stock Trading' },
  { value: 'FIXED_DEPOSIT', label: 'Fixed Deposit' },
  { value: 'PENSION', label: 'Pension' },
  { value: 'GROUP_SAVINGS', label: 'Group Savings' },
  { value: 'CROWD_FUNDING', label: 'Crowd Funding' },
  { value: 'DIGITAL_GOLD', label: 'Digital Gold' },
  { value: 'OFFSHORE_INVESTMENT', label: 'Offshore Investment' },
];

const RISK_LEVELS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
];

const NAV_OPTIONS = [
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

const fields = [
  { name: 'name', label: 'Product Name', required: true },
  { name: 'shortName', label: 'Short Name' },
  { name: 'description', label: 'Description', multiline: true },
  { name: 'category', label: 'Category', required: true, options: CATEGORIES },
  { name: 'type', label: 'Product Type', required: true, options: TYPES },
  { name: 'currency', label: 'Currency', defaultValue: 'KES' },
  { name: 'minInvestment', label: 'Minimum Investment', type: 'number' },
  { name: 'maxInvestment', label: 'Maximum Investment', type: 'number' },
  { name: 'expectedReturn', label: 'Expected Return (%)', type: 'number' },
  { name: 'riskLevel', label: 'Risk Level', options: RISK_LEVELS },
  { name: 'tenor', label: 'Tenor (days)', type: 'number' },
  { name: 'navEnabled', label: 'NAV Enabled', options: NAV_OPTIONS, defaultValue: 'false' },
  { name: 'fundManagerName', label: 'Fund Manager Name' },
];

const riskColor = (level) => {
  switch (level) {
    case 'LOW': return 'success';
    case 'MEDIUM': return 'warning';
    case 'HIGH': return 'error';
    default: return 'default';
  }
};

export default function ManageProductCatalog() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(getProducts);
  const [dialog, setDialog] = useState({ open: false, edit: null });

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (values) => {
    const payload = {
      ...values,
      minInvestment: values.minInvestment ? Number(values.minInvestment) : undefined,
      maxInvestment: values.maxInvestment ? Number(values.maxInvestment) : undefined,
      expectedReturn: values.expectedReturn ? Number(values.expectedReturn) : undefined,
      tenor: values.tenor ? Number(values.tenor) : undefined,
      navEnabled: values.navEnabled === 'true',
    };
    if (dialog.edit) await updateProduct(dialog.edit.id, payload);
    else await createProduct(payload);
    load();
  };

  const columns = [
    { field: 'name', headerName: 'Product Name', flex: 1, minWidth: 180 },
    {
      field: 'category', headerName: 'Category', width: 160,
      renderCell: (params) => params.value ? <Chip label={params.value} size="small" variant="outlined" /> : '-',
    },
    { field: 'type', headerName: 'Type', width: 160 },
    { field: 'currency', headerName: 'Currency', width: 90 },
    {
      field: 'minInvestment', headerName: 'Min Investment', width: 140,
      renderCell: (params) => formatCurrency(params.value, params.row.currency || 'KES'),
    },
    {
      field: 'riskLevel', headerName: 'Risk Level', width: 120,
      renderCell: (params) => params.value
        ? <Chip label={params.value} size="small" color={riskColor(params.value)} />
        : '-',
    },
    { field: 'status', headerName: 'Status', width: 110 },
    {
      field: 'navEnabled', headerName: 'NAV', width: 90,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Yes' : 'No'}
          size="small"
          color={params.value ? 'primary' : 'default'}
          variant={params.value ? 'filled' : 'outlined'}
        />
      ),
    },
    {
      field: 'actions', headerName: '', width: 60, sortable: false,
      renderCell: (params) => (
        <IconButton size="small" onClick={(e) => { e.stopPropagation(); setDialog({ open: true, edit: params.row }); }}>
          <EditIcon fontSize="small" />
        </IconButton>
      ),
    },
  ];

  const getInitialValues = () => {
    if (!dialog.edit) return null;
    return {
      ...dialog.edit,
      navEnabled: dialog.edit.navEnabled != null ? String(dialog.edit.navEnabled) : 'false',
    };
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Product Catalog</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onAdd={() => setDialog({ open: true, edit: null })}
        addLabel="New Product"
        onRowClick={(row) => setDialog({ open: true, edit: row })}
      />
      <FormDialog
        open={dialog.open}
        title={dialog.edit ? 'Edit Product' : 'Create Product'}
        fields={fields}
        initialValues={getInitialValues()}
        onSubmit={handleSubmit}
        onClose={() => setDialog({ open: false, edit: null })}
      />
    </Box>
  );
}
