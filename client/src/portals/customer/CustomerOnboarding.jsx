import { useEffect, useState } from 'react';
import {
  Typography, Box, Stepper, Step, StepLabel, Chip, Button, Card, CardContent, Stack,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { getWorkflows } from '../../api/orchestrationApi';
import { startOnboarding } from '../../api/orchestrationApi';
import ErrorAlert from '../../components/ErrorAlert';
import LoadingSpinner from '../../components/LoadingSpinner';
import { parseApiError } from '../../utils/errorHelper';

const ONBOARDING_STEPS = [
  { key: 'KYC', label: 'KYC Verification' },
  { key: 'SCREENING', label: 'Screening' },
  { key: 'CRM', label: 'CRM Setup' },
  { key: 'WELCOME', label: 'Welcome' },
];

const statusColor = (status) => {
  switch (status) {
    case 'COMPLETED': return 'success';
    case 'IN_PROGRESS': return 'info';
    case 'PENDING': return 'warning';
    case 'FAILED': return 'error';
    default: return 'default';
  }
};

const getActiveStep = (workflow) => {
  if (!workflow || !workflow.steps) return 0;
  const steps = workflow.steps;
  for (let i = 0; i < ONBOARDING_STEPS.length; i++) {
    const step = steps.find((s) => s.step === ONBOARDING_STEPS[i].key || s.name === ONBOARDING_STEPS[i].key);
    if (!step || step.status !== 'COMPLETED') return i;
  }
  return ONBOARDING_STEPS.length;
};

const getStepStatus = (workflow, stepKey) => {
  if (!workflow || !workflow.steps) return null;
  const step = workflow.steps.find((s) => s.step === stepKey || s.name === stepKey);
  return step ? step.status : null;
};

export default function CustomerOnboarding() {
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [starting, setStarting] = useState(false);

  const loadWorkflow = () => {
    setLoading(true);
    setPageError(null);
    getWorkflows()
      .then((data) => {
        const workflows = Array.isArray(data) ? data : [];
        const onboarding = workflows.find(
          (w) => w.type === 'ONBOARDING' || w.workflowType === 'ONBOARDING'
        );
        setWorkflow(onboarding || null);
      })
      .catch((err) => setPageError(parseApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadWorkflow(); }, []);

  const handleStartOnboarding = async () => {
    setStarting(true);
    setPageError(null);
    try {
      await startOnboarding({});
      loadWorkflow();
    } catch (err) {
      setPageError(parseApiError(err));
    } finally {
      setStarting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const activeStep = workflow ? getActiveStep(workflow) : -1;
  const isComplete = activeStep >= ONBOARDING_STEPS.length;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Onboarding</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Track your account onboarding progress.
      </Typography>

      {pageError && <ErrorAlert error={pageError} onClose={() => setPageError(null)} />}

      {!workflow ? (
        <Card sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" gutterBottom>Welcome!</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Start your onboarding process to access all wealth management features.
            </Typography>
            <Button
              variant="contained"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleStartOnboarding}
              disabled={starting}
            >
              {starting ? 'Starting...' : 'Start Onboarding'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="h6">Onboarding Progress</Typography>
              <Chip
                label={isComplete ? 'COMPLETED' : workflow.status || 'IN_PROGRESS'}
                color={isComplete ? 'success' : 'info'}
                size="small"
              />
            </Stack>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
              {ONBOARDING_STEPS.map((step) => {
                const status = getStepStatus(workflow, step.key);
                return (
                  <Step key={step.key} completed={status === 'COMPLETED'}>
                    <StepLabel
                      error={status === 'FAILED'}
                      optional={
                        status ? (
                          <Chip
                            label={status}
                            size="small"
                            color={statusColor(status)}
                            sx={{ fontSize: '0.65rem', height: 20, mt: 0.5 }}
                          />
                        ) : null
                      }
                    >
                      {step.label}
                    </StepLabel>
                  </Step>
                );
              })}
            </Stepper>

            {isComplete && (
              <Box sx={{ textAlign: 'center', py: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                <Typography variant="body1" color="success.main">
                  Your onboarding is complete. You now have full access to all features.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
