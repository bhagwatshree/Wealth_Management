import { Typography, Box, Alert } from '@mui/material';

export default function StandingInstructions() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Standing Instructions History</Typography>
      <Alert severity="info" sx={{ mt: 2 }}>
        Standing instructions history will display recurring transfer instructions and their execution status.
      </Alert>
    </Box>
  );
}
