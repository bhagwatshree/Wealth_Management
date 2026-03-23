import { useState, useEffect } from 'react';
import { Typography, Box, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { getDataTables, createDataTable, deleteDataTable } from '../../api/serviceProviderApi';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

const fields = [
  { name: 'datatableName', label: 'Data Table Name', required: true },
  { name: 'apptableName', label: 'Application Table', required: true, options: [
    { value: 'm_client', label: 'Client' },
    { value: 'm_group', label: 'Group' },
    { value: 'm_loan', label: 'Loan' },
    { value: 'm_savings_account', label: 'Savings Account' },
    { value: 'm_office', label: 'Office' },
  ]},
];

export default function ManageDataTables() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getDataTables()
      .then(data => setRows(data.map((r, i) => ({ id: i, ...r }))))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (values) => {
    await createDataTable(values);
    load();
  };

  const handleDelete = async (name) => {
    try { await deleteDataTable(name); load(); } catch (e) { setPageError(parseApiError(e)); }
  };

  const columns = [
    { field: 'registeredTableName', headerName: 'Table Name', flex: 1 },
    { field: 'applicationTableName', headerName: 'Application Table', flex: 1 },
    { field: 'actions', headerName: '', width: 60, sortable: false, renderCell: (params) => (
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDelete(params.row.registeredTableName); }}><DeleteIcon fontSize="small" /></IconButton>
    )},
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Data Tables</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      <DataTable rows={rows} columns={columns} loading={loading} onAdd={() => setDialog({ open: true })} addLabel="New Data Table" />
      <FormDialog open={dialog.open} title="Create Data Table" fields={fields} onSubmit={handleSubmit} onClose={() => setDialog({ open: false })} />
    </Box>
  );
}
