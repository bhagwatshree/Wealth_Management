import { Box, Button, TextField, Stack } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useState } from 'react';
import AddIcon from '@mui/icons-material/Add';

export default function DataTable({ rows, columns, loading, onAdd, addLabel, onRowClick }) {
  const [search, setSearch] = useState('');

  const filtered = search
    ? rows.filter(r => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
    : rows;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
        {onAdd && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
            {addLabel || 'Add New'}
          </Button>
        )}
      </Stack>
      <DataGrid
        rows={filtered}
        columns={columns}
        loading={loading}
        autoHeight
        pageSizeOptions={[10, 25, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        disableRowSelectionOnClick
        onRowClick={onRowClick ? (params) => onRowClick(params.row) : undefined}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': { cursor: onRowClick ? 'pointer' : 'default' },
          '& .MuiDataGrid-columnHeaders': { backgroundColor: '#f5f7fa' },
        }}
      />
    </Box>
  );
}
