import { Alert, AlertTitle, Typography, Box, Divider, Chip, List, ListItem, ListItemText } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

/**
 * ErrorAlert — displays structured error information.
 *
 * Props:
 *   error: {
 *     errorId?:           string  — unique error reference (e.g. ERR-A1B2C3D4)
 *     status?:            number  — HTTP status code
 *     title:              string  — short error title
 *     message:            string  — user-friendly description
 *     support?:           { message, email, phone, hours }
 *     validationErrors?:  [{ field, message }]
 *   }
 *   onClose?:  function — if provided, shows a close button
 */
export default function ErrorAlert({ error, onClose }) {
  if (!error) return null;

  const { errorId, status, title, message, support, validationErrors } = error;

  return (
    <Alert
      severity="error"
      icon={<ErrorOutlineIcon />}
      onClose={onClose}
      sx={{ mb: 2 }}
    >
      <AlertTitle sx={{ fontWeight: 'bold' }}>
        {title || 'Error'}
        {status > 0 && (
          <Chip
            label={`HTTP ${status}`}
            size="small"
            color="error"
            variant="outlined"
            sx={{ ml: 1, verticalAlign: 'middle', fontSize: '0.7rem', height: 20 }}
          />
        )}
      </AlertTitle>

      <Typography variant="body2" sx={{ mb: 1 }}>
        {message}
      </Typography>

      {/* Validation field errors */}
      {validationErrors?.length > 0 && (
        <Box sx={{ mb: 1 }}>
          <List dense disablePadding sx={{ pl: 1 }}>
            {validationErrors.map((ve, i) => (
              <ListItem key={i} disablePadding sx={{ py: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" component="span">
                      <strong>{ve.field}:</strong> {ve.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Error reference + support info */}
      {(errorId || support) && (
        <>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            {errorId && (
              <Typography variant="caption" color="text.secondary">
                Reference: <strong>{errorId}</strong>
              </Typography>
            )}
            {support && (
              <Typography variant="caption" color="text.secondary">
                {support.message} Contact: {support.email} | {support.phone} ({support.hours})
              </Typography>
            )}
          </Box>
        </>
      )}
    </Alert>
  );
}
