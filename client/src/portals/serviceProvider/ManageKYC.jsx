import { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stepper, Step, StepLabel, Card, CardContent, Grid
} from '@mui/material';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';
import { startOnboarding, getWorkflows, getWorkflow } from '../../api/orchestrationApi';

const statusColor = (s) =>
  s === 'COMPLETED' ? 'success'
    : s === 'FAILED' || s === 'FLAGGED' ? 'error'
      : s === 'SUSPENDED' || s === 'PENDING' ? 'warning'
        : 'info';

export default function ManageKYC() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(
    getWorkflows,
    (data) => (data.data || data || []).map(w => ({ ...w, id: w.workflowId }))
  );
  const [dialog, setDialog] = useState({ open: false });
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'workflowId', headerName: 'Workflow ID', flex: 1, minWidth: 280 },
    { field: 'type', headerName: 'Type', width: 140 },
    { field: 'customerId', headerName: 'Customer ID', flex: 1, minWidth: 280 },
    {
      field: 'status', headerName: 'Status', width: 140,
      renderCell: ({ value }) => (
        <Chip label={value} size="small" color={statusColor(value)} />
      )
    },
    {
      field: 'currentStep', headerName: 'Step', width: 80,
      valueGetter: (v, row) => (row.currentStep ?? 0) + 1
    },
    { field: 'createdAt', headerName: 'Created', width: 180 },
  ];

  const formFields = [
    { name: 'firstName', label: 'First Name', required: true },
    { name: 'lastName', label: 'Last Name', required: true },
    { name: 'email', label: 'Email' },
    { name: 'mobileNo', label: 'Mobile Number' },
    {
      name: 'role', label: 'Role', options: [
        { value: 'CUSTOMER', label: 'Customer' },
        { value: 'FUND_MANAGER', label: 'Fund Manager' },
        { value: 'SERVICE_PROVIDER', label: 'Service Provider' },
      ], defaultValue: 'CUSTOMER'
    },
  ];

  const handleSubmit = async (values) => {
    await startOnboarding(values);
    load();
  };

  const handleRowClick = async (row) => {
    try {
      setDetailError(null);
      const resp = await getWorkflow(row.workflowId);
      setSelectedWorkflow(resp.data || resp);
      setDetailOpen(true);
    } catch (e) {
      setDetailError(parseApiError(e));
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>KYC & Onboarding Management</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      {detailError && <ErrorAlert error={detailError} onClose={() => setDetailError(null)} />}

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onAdd={() => setDialog({ open: true })}
        addLabel="Start Onboarding"
        onRowClick={handleRowClick}
      />

      <FormDialog
        open={dialog.open}
        title="Start Customer Onboarding"
        fields={formFields}
        onSubmit={handleSubmit}
        onClose={() => setDialog({ open: false })}
      />

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Workflow Details</DialogTitle>
        <DialogContent>
          {selectedWorkflow && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Workflow ID</Typography>
                  <Typography>{selectedWorkflow.workflowId}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography>{selectedWorkflow.type}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={selectedWorkflow.status} color={statusColor(selectedWorkflow.status)} size="small" />
                </Grid>
              </Grid>

              <Stepper activeStep={selectedWorkflow.currentStep} alternativeLabel sx={{ mb: 3 }}>
                {selectedWorkflow.steps?.map((step, idx) => (
                  <Step key={idx} completed={step.status === 'COMPLETED'}>
                    <StepLabel error={step.status === 'FAILED' || step.status === 'FLAGGED'}>
                      {step.name?.replace(/_/g, ' ')}
                      <Typography variant="caption" display="block" color="text.secondary">{step.status}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>

              {selectedWorkflow.steps?.map((step, idx) => (
                <Card key={idx} variant="outlined" sx={{ mb: 1 }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" fontWeight={600}>{step.name?.replace(/_/g, ' ')}</Typography>
                      <Chip label={step.status} size="small" color={statusColor(step.status)} />
                    </Box>
                    {step.completedAt && (
                      <Typography variant="caption" color="text.secondary">Completed: {step.completedAt}</Typography>
                    )}
                    {step.error && (
                      <Typography variant="caption" color="error" display="block">{step.error}</Typography>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
