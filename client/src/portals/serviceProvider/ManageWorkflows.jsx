import { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stepper, Step, StepLabel, Card, CardContent, Grid
} from '@mui/material';
import DataTable from '../../components/DataTable';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';
import { getWorkflows, getWorkflow } from '../../api/orchestrationApi';

const statusColor = (s) =>
  s === 'COMPLETED' ? 'success'
    : s === 'FAILED' || s === 'FLAGGED' ? 'error'
      : s === 'SUSPENDED' || s === 'PENDING' ? 'warning'
        : 'info';

export default function ManageWorkflows() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(
    getWorkflows,
    (data) => (data.data || data || []).map(w => ({ ...w, id: w.workflowId }))
  );
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [detailError, setDetailError] = useState(null);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'workflowId', headerName: 'Workflow ID', flex: 1, minWidth: 280 },
    { field: 'type', headerName: 'Type', width: 160 },
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
      <Typography variant="h5" gutterBottom>Workflow Monitoring</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      {detailError && <ErrorAlert error={detailError} onClose={() => setDetailError(null)} />}

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onRowClick={handleRowClick}
      />

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Workflow Details</DialogTitle>
        <DialogContent>
          {selectedWorkflow && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Workflow ID</Typography>
                  <Typography>{selectedWorkflow.workflowId}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="body2" color="text.secondary">Type</Typography>
                  <Typography>{selectedWorkflow.type}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Customer ID</Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{selectedWorkflow.customerId || '-'}</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={selectedWorkflow.status} color={statusColor(selectedWorkflow.status)} size="small" />
                </Grid>
              </Grid>

              {selectedWorkflow.steps?.length > 0 && (
                <>
                  <Stepper activeStep={selectedWorkflow.currentStep} alternativeLabel sx={{ mb: 3 }}>
                    {selectedWorkflow.steps.map((step, idx) => (
                      <Step key={idx} completed={step.status === 'COMPLETED'}>
                        <StepLabel error={step.status === 'FAILED' || step.status === 'FLAGGED'}>
                          {step.name?.replace(/_/g, ' ')}
                          <Typography variant="caption" display="block" color="text.secondary">{step.status}</Typography>
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>

                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Step Details</Typography>
                  {selectedWorkflow.steps.map((step, idx) => (
                    <Card key={idx} variant="outlined" sx={{ mb: 1 }}>
                      <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" fontWeight={600}>
                            Step {idx + 1}: {step.name?.replace(/_/g, ' ')}
                          </Typography>
                          <Chip label={step.status} size="small" color={statusColor(step.status)} />
                        </Box>
                        {step.startedAt && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Started: {step.startedAt}
                          </Typography>
                        )}
                        {step.completedAt && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Completed: {step.completedAt}
                          </Typography>
                        )}
                        {step.duration && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            Duration: {step.duration}
                          </Typography>
                        )}
                        {step.error && (
                          <Typography variant="caption" color="error" display="block">
                            Error: {step.error}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </>
              )}

              {selectedWorkflow.createdAt && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Created: {selectedWorkflow.createdAt}
                    {selectedWorkflow.updatedAt && ` | Updated: ${selectedWorkflow.updatedAt}`}
                  </Typography>
                </Box>
              )}
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
