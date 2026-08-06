import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { EmailOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (requestError) {
      setError(requestError.response?.data?.detail || requestError.message || 'Sign in failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(360px, 0.8fr) minmax(520px, 1.2fr)' }, bgcolor: 'background.paper' }}>
      <Box
        component="section"
        sx={{
          display: { xs: 'none', md: 'flex' },
          minHeight: '100dvh',
          flexDirection: 'column',
          justifyContent: 'space-between',
          bgcolor: 'primary.dark',
          color: 'primary.contrastText',
          p: { md: 5, lg: 7 },
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            width: 360,
            height: 360,
            right: -180,
            bottom: -180,
            borderRadius: '50%',
            border: '72px solid rgba(255,255,255,0.055)',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
          <Box sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: '#FFFFFF', color: 'primary.dark', display: 'grid', placeItems: 'center', fontWeight: 850, letterSpacing: '-0.04em' }}>
            MNA
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#FFFFFF', lineHeight: 1.25 }}>Naveed Qamar</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>Official administration portal</Typography>
          </Box>
        </Box>

        <Box sx={{ position: 'relative', maxWidth: 520 }}>
          <Typography component="h1" sx={{ fontSize: { md: '2.5rem', lg: '3.25rem' }, lineHeight: 1.08, fontWeight: 760, letterSpacing: '-0.035em', textWrap: 'balance' }}>
            Manage public services with clarity.
          </Typography>
          <Typography sx={{ mt: 2, maxWidth: 500, color: 'rgba(255,255,255,0.78)', fontSize: '1rem', lineHeight: 1.65 }}>
            A secure workspace for citizen services, scheme records, publishing, and administrative access.
          </Typography>
        </Box>

        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.62)', position: 'relative' }}>
          Authorized personnel only
        </Typography>
      </Box>

      <Box component="main" sx={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', px: { xs: 2.5, sm: 5, lg: 8 }, py: 5 }}>
        <Box sx={{ width: '100%', maxWidth: 430 }}>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1.25, mb: 6 }}>
            <Box sx={{ width: 40, height: 40, borderRadius: 2.25, bgcolor: 'primary.main', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: '0.8rem', fontWeight: 850 }}>
              MNA
            </Box>
            <Box>
              <Typography variant="subtitle1" sx={{ lineHeight: 1.2 }}>Naveed Qamar</Typography>
              <Typography variant="caption" color="text.secondary">Administration portal</Typography>
            </Box>
          </Box>

          <Typography component="h2" variant="h4">Sign in to continue</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 3.5 }}>
            Use your administrator account credentials.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.25 }}>
              <TextField
                id="login-email"
                fullWidth
                label="Email address"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start"><EmailOutlined color="action" fontSize="small" /></InputAdornment> },
                }}
              />
              <TextField
                id="login-password"
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start"><LockOutlined color="action" fontSize="small" /></InputAdornment>,
                    endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((visible) => !visible)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                    ),
                  },
                }}
              />
              <Button id="login-submit" type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ minHeight: 48, mt: 0.5 }}>
                {loading ? <CircularProgress size={22} color="inherit" aria-label="Signing in" /> : 'Sign in'}
              </Button>
            </Box>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
            Contact your portal administrator if you need access.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
