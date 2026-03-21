import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  return (
    <Dialog open={open} onClose={(e, reason) => { if (reason !== 'backdropClick') onCancel(); }} disableEscapeKeyDown>
      <DialogTitle>{title || 'Confirm'}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message || 'Are you sure?'}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
