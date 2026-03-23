import { useState, useEffect } from 'react';
import { Typography, Box, IconButton, Card, CardContent } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getWorkingDays, updateWorkingDays } from '../../api/serviceProviderApi';
import FormDialog from '../../components/FormDialog';
import ErrorAlert from '../../components/ErrorAlert';
import { parseApiError } from '../../utils/errorHelper';

export default function ManageWorkingDays() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialog, setDialog] = useState({ open: false });
  const [pageError, setPageError] = useState(null);

  const load = () => {
    setLoading(true);
    setPageError(null);
    getWorkingDays()
      .then(d => setData(d))
      .catch(e => setPageError(parseApiError(e)))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const rescheduleLabels = {
    1: 'Same day',
    2: 'Next working day',
    3: 'Previous working day',
  };

  const fields = [
    { name: 'recurrence', label: 'Recurrence Pattern', required: true },
    {
      name: 'repaymentRescheduleType',
      label: 'Repayment Rescheduling Type',
      required: true,
      options: [
        { value: 1, label: 'Same day' },
        { value: 2, label: 'Next working day' },
        { value: 3, label: 'Previous working day' },
      ],
    },
    {
      name: 'extendTermForDailyRepayments',
      label: 'Extend Term for Daily Repayments',
      type: 'checkbox',
      options: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
    },
  ];

  const handleSubmit = async (values) => {
    const payload = { ...values, locale: 'en' };
    await updateWorkingDays(payload);
    load();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Manage Working Days</Typography>
      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}
      {loading && <Typography>Loading...</Typography>}
      {data && (
        <Card sx={{ maxWidth: 600, mt: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Working Days Configuration</Typography>
              <IconButton size="small" onClick={() => setDialog({ open: true })}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="body1" gutterBottom>
              <strong>Recurrence Pattern:</strong> {data.recurrence || '-'}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Repayment Rescheduling Type:</strong> {rescheduleLabels[data.repaymentRescheduleType] || data.repaymentRescheduleType || '-'}
            </Typography>
            <Typography variant="body1">
              <strong>Extend Term for Daily Repayments:</strong> {data.extendTermForDailyRepayments ? 'Yes' : 'No'}
            </Typography>
          </CardContent>
        </Card>
      )}
      <FormDialog
        open={dialog.open}
        title="Edit Working Days"
        fields={fields}
        initialValues={data}
        onSubmit={handleSubmit}
        onClose={() => setDialog({ open: false })}
      />
    </Box>
  );
}
