import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, MenuItem, Stack } from '@mui/material';
import ErrorAlert from './ErrorAlert';
import { parseApiError } from '../utils/errorHelper';

export default function FormDialog({ open, title, fields, initialValues, onSubmit, onClose }) {
  const [values, setValues] = useState({});
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const defaults = {};
      fields.forEach(f => { defaults[f.name] = initialValues?.[f.name] ?? f.defaultValue ?? ''; });
      setValues(defaults);
      setError(null);
    }
  }, [open, initialValues, fields]);

  const handleChange = (name) => (e) => {
    setValues(prev => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (e) {
      setError(parseApiError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={(e, reason) => { if (reason !== 'backdropClick') onClose(); }} maxWidth="sm" fullWidth disableEscapeKeyDown>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        {error && <ErrorAlert error={error} onClose={() => setError(null)} />}
        <Stack spacing={2} sx={{ mt: 1 }}>
          {fields.map(f => (
            f.options ? (
              <TextField
                key={f.name}
                select
                label={f.label}
                value={values[f.name] ?? ''}
                onChange={handleChange(f.name)}
                fullWidth
                required={f.required}
                size="small"
              >
                {f.options.map(o => (
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                key={f.name}
                label={f.label}
                value={values[f.name] ?? ''}
                onChange={handleChange(f.name)}
                fullWidth
                required={f.required}
                type={f.type || 'text'}
                size="small"
                multiline={f.multiline}
                rows={f.multiline ? 3 : 1}
              />
            )
          ))}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
