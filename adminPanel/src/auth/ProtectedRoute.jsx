import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Box, CircularProgress } from '@mui/material';

export default function ProtectedRoute({ children, module, action }) {
  const { user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (module && action && !hasPermission(module, action)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
