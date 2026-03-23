import { Typography, Box, Card, CardContent, Alert, Grid } from '@mui/material';

const importTypes = [
  { name: 'Offices', description: 'Import office hierarchy and branch data from a spreadsheet.' },
  { name: 'Staff', description: 'Import staff members and their office assignments.' },
  { name: 'Clients', description: 'Import client records including personal and account details.' },
  { name: 'Loan Accounts', description: 'Import loan accounts with terms, schedules, and disbursement data.' },
  { name: 'Savings Accounts', description: 'Import savings accounts with product and balance information.' },
  { name: 'Journal Entries', description: 'Import accounting journal entries for bulk transaction posting.' },
];

export default function BulkImport() {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>Bulk Import</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Use this page to import data in bulk from spreadsheet files.
      </Alert>
      <Grid container spacing={2}>
        {importTypes.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.name}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">{item.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
