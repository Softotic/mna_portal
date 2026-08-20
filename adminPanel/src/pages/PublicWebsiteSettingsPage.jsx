import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  LinearProgress,
  TextField,
  Typography,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { publicSettingsAPI } from '../api';

function formatApiError(error) {
  const data = error.response?.data;

  if (!data) {
    return 'Error saving website settings.';
  }

  if (typeof data === 'string') {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => {
        const text = Array.isArray(messages) ? messages.join(' ') : String(messages);
        return `${field}: ${text}`;
      })
      .join('\n');
  }

  return 'Error saving website settings.';
}

export default function PublicWebsiteSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await publicSettingsAPI.current();
      setSettings(response.data);
    } catch (err) {
      console.error(err);
      setMessage({ severity: 'error', text: 'Error loading website settings.' });
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
      const payload = { ...settings };
      delete payload.id;
      delete payload.created_at;
      delete payload.updated_at;

      // Existing file fields are URLs (or empty strings) returned by the API.
      // Only send them back when the user has selected a real replacement file.
      if (!(payload.logo instanceof File)) {
        delete payload.logo;
      }
      if (!(payload.intro_image instanceof File)) {
        delete payload.intro_image;
      }

      await publicSettingsAPI.update(settings.id, payload);
      await fetchSettings();
      setMessage({ severity: 'success', text: 'Website settings saved successfully. Refresh the public website to see the changes.' });
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error(err);
      setMessage({ severity: 'error', text: formatApiError(err) });
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
        <Alert severity="error">Failed to load website settings.</Alert>
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
          Personalize the MNA public website with local identity, contact channels, and social information.
        </Typography>
      </Box>

      {message && (
        <Alert
          severity={message.severity}
          sx={{ mb: 3 }}
          onClose={() => setMessage(null)}
        >
          {message.text}
        </Alert>
      )}

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardHeader title="Leader Identity" sx={{ bgcolor: '#fafbfc' }} />
        <Divider />
        <CardContent>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField label="Site Name" fullWidth value={settings.site_name || ''} onChange={(e) => handleChange('site_name', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Leader Name" fullWidth value={settings.leader_name || ''} onChange={(e) => handleChange('leader_name', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Designation" fullWidth value={settings.designation || ''} onChange={(e) => handleChange('designation', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="Constituency" fullWidth value={settings.constituency || ''} onChange={(e) => handleChange('constituency', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField label="District / City" fullWidth value={settings.district || ''} onChange={(e) => handleChange('district', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Logo
                </Typography>
                <input type="file" accept="image/*,.svg" onChange={(e) => handleFileChange('logo', e.target.files?.[0])} />
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
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Hero Statement"
                fullWidth
                multiline
                rows={2}
                value={settings.hero_statement || ''}
                onChange={(e) => handleChange('hero_statement', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardHeader title="Public Content" sx={{ bgcolor: '#fafbfc' }} />
        <Divider />
        <CardContent>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField label="Introduction" fullWidth multiline rows={4} value={settings.intro || ''} onChange={(e) => handleChange('intro', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Hero / Introduction Image
                </Typography>
                <input type="file" accept="image/*" onChange={(e) => handleFileChange('intro_image', e.target.files?.[0])} />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField label="About Section" fullWidth multiline rows={4} value={settings.about || ''} onChange={(e) => handleChange('about', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Achievements / Focus Areas"
                fullWidth
                multiline
                rows={4}
                helperText="Enter one achievement or public focus area per line."
                value={settings.achievements || ''}
                onChange={(e) => handleChange('achievements', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Vision" fullWidth multiline rows={3} value={settings.vision || ''} onChange={(e) => handleChange('vision', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Mission" fullWidth multiline rows={3} value={settings.mission || ''} onChange={(e) => handleChange('mission', e.target.value)} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Values"
                fullWidth
                multiline
                rows={3}
                helperText="Enter one value per line."
                value={settings.values || ''}
                onChange={(e) => handleChange('values', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius: 2, mb: 3 }}>
        <CardHeader title="Office Contact & Social Links" sx={{ bgcolor: '#fafbfc' }} />
        <Divider />
        <CardContent>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField label="Office Address" fullWidth multiline rows={3} value={settings.office_address || ''} onChange={(e) => handleChange('office_address', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Office Hours" fullWidth value={settings.office_hours || ''} onChange={(e) => handleChange('office_hours', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Contact Email" fullWidth value={settings.contact_email || ''} onChange={(e) => handleChange('contact_email', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Contact Phone" fullWidth value={settings.contact_phone || ''} onChange={(e) => handleChange('contact_phone', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="WhatsApp" fullWidth value={settings.whatsapp || ''} onChange={(e) => handleChange('whatsapp', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Facebook URL" fullWidth value={settings.facebook_url || ''} onChange={(e) => handleChange('facebook_url', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="X / Twitter URL" fullWidth value={settings.x_url || ''} onChange={(e) => handleChange('x_url', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Instagram URL" fullWidth value={settings.instagram_url || ''} onChange={(e) => handleChange('instagram_url', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="YouTube URL" fullWidth value={settings.youtube_url || ''} onChange={(e) => handleChange('youtube_url', e.target.value)} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField label="Website URL" fullWidth value={settings.website_url || ''} onChange={(e) => handleChange('website_url', e.target.value)} />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={handleSave}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </Box>
  );
}
