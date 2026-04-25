import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  LinearProgress,
  Alert,
  Paper,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { publicSettingsAPI } from '../api';

export default function PublicWebsiteSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await publicSettingsAPI.current();
      setSettings(response.data);
    } catch (err) {
      setMessage('Error loading settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    if (file) {
      setSettings((prev) => ({ ...prev, [field]: file }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = { ...settings };
      delete data.id;
      delete data.created_at;
      delete data.updated_at;

      await publicSettingsAPI.update(data);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchSettings();
    } catch (err) {
      setMessage(err.response?.data?.detail || 'Error saving settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  if (!settings) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load settings</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fa', p: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
          Public Website Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your public website content and appearance
        </Typography>
      </Box>

      {message && (
        <Alert
          severity={message.includes('Error') ? 'error' : 'success'}
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* Site Identity */}
      <Card sx={{ borderRadius: 2, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardHeader
          title="Site Identity"
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, fontSize: '1rem' } }}
          sx={{ pb: 2, pt: 3, px: 3, bgcolor: '#fafbfc' }}
        />
        <Divider />
        <CardContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Site Name"
                fullWidth
                value={settings.site_name || ''}
                onChange={(e) => handleChange('site_name', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Logo
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('logo', e.target.files?.[0])}
                  style={{ marginBottom: '8px' }}
                />
                {settings.logo && typeof settings.logo === 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={settings.logo}
                      alt="Logo"
                      style={{ maxHeight: '80px', maxWidth: '200px' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Site Message / Tagline"
                fullWidth
                multiline
                rows={2}
                value={settings.site_message || ''}
                onChange={(e) => handleChange('site_message', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Landing Page Content */}
      <Card sx={{ borderRadius: 2, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardHeader
          title="Landing Page Content"
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, fontSize: '1rem' } }}
          sx={{ pb: 2, pt: 3, px: 3, bgcolor: '#fafbfc' }}
        />
        <Divider />
        <CardContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Introduction"
                fullWidth
                multiline
                rows={4}
                value={settings.intro || ''}
                onChange={(e) => handleChange('intro', e.target.value)}
                variant="outlined"
                size="small"
                helperText="Main introduction text for the landing page"
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Introduction Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('intro_image', e.target.files?.[0])}
                  style={{ marginBottom: '8px' }}
                />
                {settings.intro_image && typeof settings.intro_image === 'string' && (
                  <Box sx={{ mt: 1 }}>
                    <img
                      src={settings.intro_image}
                      alt="Intro"
                      style={{ maxHeight: '200px', maxWidth: '100%' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="About"
                fullWidth
                multiline
                rows={4}
                value={settings.about || ''}
                onChange={(e) => handleChange('about', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Organization Information */}
      <Card sx={{ borderRadius: 2, mb: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardHeader
          title="Organization Information"
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, fontSize: '1rem' } }}
          sx={{ pb: 2, pt: 3, px: 3, bgcolor: '#fafbfc' }}
        />
        <Divider />
        <CardContent sx={{ pt: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Vision"
                fullWidth
                multiline
                rows={3}
                value={settings.vision || ''}
                onChange={(e) => handleChange('vision', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mission"
                fullWidth
                multiline
                rows={3}
                value={settings.mission || ''}
                onChange={(e) => handleChange('mission', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Values"
                fullWidth
                multiline
                rows={3}
                value={settings.values || ''}
                onChange={(e) => handleChange('values', e.target.value)}
                variant="outlined"
                size="small"
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={saving}
          onClick={handleSave}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}
