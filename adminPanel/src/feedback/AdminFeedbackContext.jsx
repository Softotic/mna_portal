import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Typography,
} from '@mui/material';
import { DeleteForeverOutlined, WarningAmberRounded } from '@mui/icons-material';

const AdminFeedbackContext = createContext(null);

export function AdminFeedbackProvider({ children }) {
  const [notice, setNotice] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const confirmationResolver = useRef(null);

  const notify = useCallback((message, severity = 'info') => {
    setNotice({ message, severity, key: Date.now() });
  }, []);

  const confirm = useCallback((options = {}) => new Promise((resolve) => {
    confirmationResolver.current?.(false);
    confirmationResolver.current = resolve;
    setConfirmation({
      title: 'Delete this item?',
      description: 'This action permanently removes the item and cannot be undone.',
      confirmLabel: 'Delete',
      ...options,
    });
  }), []);

  const closeConfirmation = useCallback((result) => {
    const resolve = confirmationResolver.current;
    confirmationResolver.current = null;
    setConfirmation(null);
    resolve?.(result);
  }, []);

  const value = useMemo(() => ({ confirm, notify }), [confirm, notify]);

  return (
    <AdminFeedbackContext.Provider value={value}>
      {children}

      <Dialog
        open={Boolean(confirmation)}
        onClose={() => closeConfirmation(false)}
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-description"
        maxWidth="xs"
        fullWidth
        slotProps={{
          backdrop: { sx: { bgcolor: 'rgba(7, 24, 16, 0.58)' } },
          paper: {
            sx: {
              m: 2,
              border: 0,
              borderRadius: 3,
              boxShadow: '0 8px 20px rgba(7, 24, 16, 0.18)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <DialogTitle id="delete-confirmation-title" sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', pb: 1 }}>
          <Box
            aria-hidden="true"
            sx={{
              width: 40,
              height: 40,
              flex: '0 0 auto',
              borderRadius: 2.5,
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'rgba(184, 59, 67, 0.1)',
              color: 'error.main',
            }}
          >
            <WarningAmberRounded fontSize="small" />
          </Box>
          <Box>
            <Typography component="span" variant="h6" sx={{ display: 'block', color: 'text.primary' }}>
              {confirmation?.title}
            </Typography>
            <Typography component="span" variant="caption" sx={{ display: 'block', mt: 0.25, color: 'error.dark', fontWeight: 700 }}>
              Permanent action
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 1, pb: 2.5 }}>
          <DialogContentText id="delete-confirmation-description" sx={{ color: 'text.secondary', lineHeight: 1.65 }}>
            {confirmation?.description}
          </DialogContentText>
          {confirmation?.itemName && (
            <Box sx={{ mt: 2, px: 1.5, py: 1.25, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700, overflowWrap: 'anywhere' }}>
                {confirmation.itemName}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F7F9F8', borderTop: '1px solid', borderColor: 'divider' }}>
          <Button autoFocus variant="outlined" color="inherit" onClick={() => closeConfirmation(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteForeverOutlined />}
            onClick={() => closeConfirmation(true)}
          >
            {confirmation?.confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        key={notice?.key}
        open={Boolean(notice)}
        autoHideDuration={4500}
        onClose={(_, reason) => reason !== 'clickaway' && setNotice(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 7, maxWidth: { xs: 'calc(100% - 32px)', sm: 420 } }}
      >
        <Alert
          severity={notice?.severity || 'info'}
          variant="filled"
          onClose={() => setNotice(null)}
          sx={{ width: '100%', boxShadow: 3 }}
        >
          {notice?.message}
        </Alert>
      </Snackbar>
    </AdminFeedbackContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminFeedback() {
  const context = useContext(AdminFeedbackContext);
  if (!context) throw new Error('useAdminFeedback must be used within AdminFeedbackProvider');
  return context;
}
