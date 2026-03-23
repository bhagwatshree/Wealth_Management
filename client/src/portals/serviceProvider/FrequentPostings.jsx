import { Typography, Box, Button, Stack, Alert, Card, CardContent } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const commonPostings = [
  { title: 'Salary Payment', description: 'Process monthly salary payments to staff accounts' },
  { title: 'Rent Payment', description: 'Record periodic rent payment entries' },
  { title: 'Revenue Collection', description: 'Post revenue collection journal entries' },
];

export default function FrequentPostings() {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Frequent Postings</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Frequent postings allow you to quickly create commonly used journal entries.
      </Alert>
      <Button variant="contained" sx={{ mb: 3 }} onClick={() => navigate('/service-provider/journal-entries')}>
        Go to Journal Entries
      </Button>
      <Stack spacing={2}>
        {commonPostings.map((posting) => (
          <Card key={posting.title}>
            <CardContent>
              <Typography variant="h6">{posting.title}</Typography>
              <Typography variant="body2" color="text.secondary">{posting.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
