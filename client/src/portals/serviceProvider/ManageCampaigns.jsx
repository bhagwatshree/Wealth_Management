import { useEffect, useState } from 'react';
import {
  Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, Card, CardContent, TextField
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DataTable from '../../components/DataTable';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import usePageData from '../../hooks/usePageData';
import { parseApiError } from '../../utils/errorHelper';
import { getCampaigns, createCampaign, triggerCampaign, getCampaignTargeting } from '../../api/orchestrationApi';

const channelColor = (ch) => {
  const map = { EMAIL: 'primary', SMS: 'secondary', PUSH: 'warning', IN_APP: 'info' };
  return map[ch] || 'default';
};

const statusColor = (s) => {
  const map = { ACTIVE: 'success', DRAFT: 'default', COMPLETED: 'info', PAUSED: 'warning', CANCELLED: 'error' };
  return map[s] || 'default';
};

const TRIGGER_EVENTS = [
  'ACCOUNT_OPENED', 'KYC_COMPLETED', 'FIRST_DEPOSIT', 'DORMANCY_WARNING',
  'BIRTHDAY', 'ANNIVERSARY', 'SEGMENT_UPGRADE', 'LARGE_TRANSACTION',
  'LOAN_MATURITY', 'PRODUCT_RENEWAL',
];

export default function ManageCampaigns() {
  const { rows, loading, pageError, clearPageError, load } = usePageData(
    getCampaigns,
    (data) => (data.data || data || []).map(c => ({ ...c, id: c.campaignId }))
  );
  const [dialog, setDialog] = useState({ open: false });
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [targeting, setTargeting] = useState(null);
  const [detailError, setDetailError] = useState(null);
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [customerIdsInput, setCustomerIdsInput] = useState('');

  useEffect(() => { load(); }, [load]);

  const columns = [
    { field: 'campaignId', headerName: 'Campaign ID', flex: 1, minWidth: 280 },
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
    {
      field: 'channel', headerName: 'Channel', width: 120,
      renderCell: ({ value }) => value ? <Chip label={value} size="small" color={channelColor(value)} variant="outlined" /> : null
    },
    {
      field: 'status', headerName: 'Status', width: 120,
      renderCell: ({ value }) => value ? <Chip label={value} size="small" color={statusColor(value)} /> : null
    },
    { field: 'targeted', headerName: 'Targeted', width: 100 },
    { field: 'dispatched', headerName: 'Dispatched', width: 100 },
    { field: 'createdAt', headerName: 'Created', width: 180 },
  ];

  const formFields = [
    { name: 'name', label: 'Campaign Name', required: true },
    { name: 'description', label: 'Description', multiline: true },
    {
      name: 'channel', label: 'Channel', required: true, options: [
        { value: 'EMAIL', label: 'Email' },
        { value: 'SMS', label: 'SMS' },
        { value: 'PUSH', label: 'Push Notification' },
        { value: 'IN_APP', label: 'In-App Message' },
      ], defaultValue: 'EMAIL'
    },
    { name: 'offerType', label: 'Offer Type' },
    { name: 'offerTitle', label: 'Offer Title', required: true },
    { name: 'offerBody', label: 'Offer Body', multiline: true, required: true },
    {
      name: 'triggerEvent', label: 'Trigger Event', options: TRIGGER_EVENTS.map(e => ({
        value: e, label: e.replace(/_/g, ' ')
      }))
    },
  ];

  const handleSubmit = async (values) => {
    await createCampaign(values);
    load();
  };

  const handleRowClick = async (row) => {
    try {
      setDetailError(null);
      setSelectedCampaign(row);
      setCustomerIdsInput('');
      try {
        const resp = await getCampaignTargeting(row.campaignId);
        setTargeting(resp.data || resp);
      } catch {
        setTargeting(null);
      }
      setDetailOpen(true);
    } catch (e) {
      setDetailError(parseApiError(e));
    }
  };

  const handleTrigger = async () => {
    if (!selectedCampaign) return;
    setTriggerLoading(true);
    setDetailError(null);
    try {
      const customerIds = customerIdsInput.trim()
        ? customerIdsInput.split(',').map(id => id.trim()).filter(Boolean)
        : undefined;
      await triggerCampaign(selectedCampaign.campaignId, customerIds);
      setDetailOpen(false);
      load();
    } catch (e) {
      setDetailError(parseApiError(e));
    } finally {
      setTriggerLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>CVM Campaign Management</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={clearPageError} />}
      {detailError && !detailOpen && <ErrorAlert error={detailError} onClose={() => setDetailError(null)} />}

      <DataTable
        rows={rows}
        columns={columns}
        loading={loading}
        onAdd={() => setDialog({ open: true })}
        addLabel="New Campaign"
        onRowClick={handleRowClick}
      />

      <FormDialog
        open={dialog.open}
        title="Create Campaign"
        fields={formFields}
        onSubmit={handleSubmit}
        onClose={() => setDialog({ open: false })}
      />

      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Campaign Details</DialogTitle>
        <DialogContent>
          {detailError && <ErrorAlert error={detailError} onClose={() => setDetailError(null)} />}
          {selectedCampaign && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Campaign Name</Typography>
                  <Typography fontWeight={600}>{selectedCampaign.name}</Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Channel</Typography>
                  <Chip label={selectedCampaign.channel} size="small" color={channelColor(selectedCampaign.channel)} variant="outlined" />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip label={selectedCampaign.status} size="small" color={statusColor(selectedCampaign.status)} />
                </Grid>
              </Grid>

              {selectedCampaign.description && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="body2" color="text.secondary">Description</Typography>
                    <Typography variant="body2">{selectedCampaign.description}</Typography>
                  </CardContent>
                </Card>
              )}

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="h6">{selectedCampaign.targeted ?? 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Targeted</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="h6">{selectedCampaign.dispatched ?? 0}</Typography>
                      <Typography variant="caption" color="text.secondary">Dispatched</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="h6">{selectedCampaign.offerType || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">Offer Type</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={3}>
                  <Card variant="outlined">
                    <CardContent sx={{ textAlign: 'center', py: 1, '&:last-child': { pb: 1 } }}>
                      <Typography variant="h6">{selectedCampaign.triggerEvent?.replace(/_/g, ' ') || '-'}</Typography>
                      <Typography variant="caption" color="text.secondary">Trigger Event</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {targeting && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>Targeting Rules</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {targeting.segment && `Segment: ${targeting.segment}`}
                      {targeting.criteria && ` | Criteria: ${JSON.stringify(targeting.criteria)}`}
                      {!targeting.segment && !targeting.criteria && 'No targeting rules defined'}
                    </Typography>
                  </CardContent>
                </Card>
              )}

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Dispatch Campaign</Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  size="small"
                  label="Customer IDs (comma-separated, optional)"
                  value={customerIdsInput}
                  onChange={(e) => setCustomerIdsInput(e.target.value)}
                  sx={{ flexGrow: 1 }}
                  placeholder="Leave empty to target all eligible"
                />
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  onClick={handleTrigger}
                  disabled={triggerLoading}
                >
                  {triggerLoading ? 'Dispatching...' : 'Trigger'}
                </Button>
              </Box>
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
