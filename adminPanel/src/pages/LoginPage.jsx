import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Alert, InputAdornment, IconButton, CircularProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Lock, Email } from '@mui/icons-material';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0D3B0F 0%, #1B5E20 30%, #2E7D32 60%, #00695C 100%)',
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""', position: 'absolute', top: '-50%', left: '-50%',
        width: '200%', height: '200%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px)',
        backgroundSize: '30px 30px',
      },
    }}>
      {/* Floating decorative elements */}
      <Box sx={{
        position: 'absolute', top: '10%', right: '15%', width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
        animation: 'float 6s ease-in-out infinite',
        '@keyframes float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      }} />
      <Box sx={{
        position: 'absolute', bottom: '20%', left: '10%', width: 150, height: 150,
        borderRadius: '50%', background: 'rgba(255,255,255,0.02)',
        animation: 'float 8s ease-in-out infinite 1s',
      }} />

      <Card sx={{
        width: '100%', maxWidth: 440, mx: 2,
        borderRadius: 5,
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
        backdropFilter: 'blur(15px)',
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(255,255,255,0.4)',
        position: 'relative',
        overflow: 'visible',
      }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{
              width: 72, height: 72, borderRadius: 3, mx: 'auto', mb: 2.5,
              background: 'linear-gradient(135deg, #1B5E20 0%, #4CAF50 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(27,94,32,0.35)',
              border: '2px solid rgba(255,255,255,0.2)',
            }}>
              <Typography variant="h4" sx={{ color: '#fff', fontWeight: 900, fontSize: '2.2rem' }}>N</Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1B5E20', letterSpacing: '-0.02em', mb: 0.5 }}>
              MNA Naveed Qamar&apos;s Portal
            </Typography>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'text.secondary', opacity: 0.8 }}>
              Portal Admin Panel
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              id="login-email"
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><Email color="action" /></InputAdornment>
                ),
              }}
            />
            <TextField
              id="login-password"
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><Lock color="action" /></InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              id="login-submit"
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.8, fontSize: '1.05rem', fontWeight: 700,
                borderRadius: 2.5,
                textTransform: 'none',
                background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                boxShadow: '0 8px 20px rgba(27,94,32,0.25)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #0D3B0F 0%, #1B5E20 100%)',
                  boxShadow: '0 12px 28px rgba(27,94,32,0.35)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Enter Portal'}
            </Button>
          </form>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
            Contact your administrator for account access
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
