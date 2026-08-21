import { createElement, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {
  BadgeOutlined,
  CloudUploadOutlined,
  ContactMailOutlined,
  HomeOutlined,
  InfoOutlined,
  Save as SaveIcon,
} from '@mui/icons-material';
import { publicSettingsAPI } from '../api';

const sections = [
  { id: 'identity', label: 'Identity', description: 'Name, role and logo', icon: BadgeOutlined },
  { id: 'homepage', label: 'Homepage', description: 'Hero and introduction', icon: HomeOutlined },
  { id: 'about', label: 'About', description: 'Biography and public record', icon: InfoOutlined },
  { id: 'contact', label: 'Contact', description: 'Office and social links', icon: ContactMailOutlined },
];

const fieldGridSx = {
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
  gap: 2.25,
};

function formatApiError(error) {
  const data = error.response?.data;
  if (!data) return 'Error saving website settings.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (typeof data === 'object') {
    return Object.entries(data)
      .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(' ') : String(messages)}`)
      .join('\n');
  }
  return 'Error saving website settings.';
}

function SectionHeading({ title, description }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 680 }}>
        {description}
      </Typography>
    </Box>
  );
}

function ImageUpload({ id, label, hint, value, onChange, aspectRatio = '16 / 9' }) {
  const preview = useMemo(
    () => (value instanceof File ? URL.createObjectURL(value) : typeof value === 'string' ? value : ''),
    [value],
  );

  useEffect(() => {
    if (!(value instanceof File)) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview, value]);

  return (
    <Box>
      <Typography component="label" htmlFor={id} variant="subtitle2" sx={{ display: 'block', mb: 1 }}>
        {label}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '96px minmax(0, 1fr)', sm: '132px minmax(0, 1fr)' },
          gap: 2,
          alignItems: 'center',
          p: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1.5,
          bgcolor: '#FAFCFB',
        }}
      >
        <Box sx={{ width: '100%', aspectRatio, borderRadius: 1, overflow: 'hidden', bgcolor: '#E8EFEB', display: 'grid', placeItems: 'center' }}>
          {preview ? (
            <Box component="img" src={preview} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <CloudUploadOutlined sx={{ color: 'text.disabled' }} />
          )}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 680 }} noWrap>
            {value instanceof File ? value.name : preview ? 'Current image' : 'No image uploaded'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.35, mb: 1.25 }}>
            {hint}
          </Typography>
          <Button component="label" htmlFor={id} variant="outlined" size="small" startIcon={<CloudUploadOutlined />}>
            {preview ? 'Replace image' : 'Choose image'}
            <input id={id} hidden type="file" accept="image/*" onChange={(event) => onChange(event.target.files?.[0])} />
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default function PublicWebsiteSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [activeSection, setActiveSection] = useState('identity');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await publicSettingsAPI.current();
      setSettings(response.data);
    } catch (error) {
      console.error(error);
      setMessage({ severity: 'error', text: 'Error loading website settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => setSettings((previous) => ({ ...previous, [field]: value }));
  const handleFileChange = (field, file) => {
    if (file) handleChange(field, file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings };
      ['id', 'created_at', 'updated_at'].forEach((field) => delete payload[field]);
      ['logo', 'intro_image', 'about_image'].forEach((field) => {
        if (!(payload[field] instanceof File)) delete payload[field];
      });

      await publicSettingsAPI.update(settings.id, payload);
      await fetchSettings();
      setMessage({ severity: 'success', text: 'Website settings saved. The public website now has the latest content.' });
      window.setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error(error);
      setMessage({ severity: 'error', text: formatApiError(error) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LinearProgress aria-label="Loading website settings" />;
  if (!settings) return <Alert severity="error">Failed to load website settings.</Alert>;

  return (
    <Box sx={{ maxWidth: 1220 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: 2, mb: 3.5 }}>
        <Box>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center', mb: 0.75 }}>
            <Typography variant="h4">Public Website Settings</Typography>
            <Chip label="Public website" size="small" color="success" variant="outlined" />
          </Stack>
          <Typography color="text.secondary" sx={{ maxWidth: 700 }}>
            Manage the information and images shown across the public-facing website.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={handleSave} sx={{ alignSelf: 'flex-start' }}>
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </Box>

      {message && (
        <Alert severity={message.severity} onClose={() => setMessage(null)} sx={{ mb: 2.5, whiteSpace: 'pre-line' }}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Tabs value={activeSection} onChange={(_, value) => setActiveSection(value)} variant="scrollable" scrollButtons="auto" aria-label="Website settings sections" sx={{ px: { xs: 1, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#FAFCFB' }}>
          {sections.map(({ id, label, description, icon }) => (
            <Tab
              key={id}
              value={id}
              icon={createElement(icon, { fontSize: 'small' })}
              iconPosition="start"
              label={<Box sx={{ textAlign: 'left' }}><Typography variant="subtitle2" color="inherit">{label}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>{description}</Typography></Box>}
              sx={{ minHeight: 70, alignItems: 'center', px: { xs: 1.5, sm: 2.25 } }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          {activeSection === 'identity' && (
            <Box role="tabpanel">
              <SectionHeading title="Leader identity" description="Core details used in the site header, page titles and official profile." />
              <Box sx={fieldGridSx}>
                <TextField label="Site name" fullWidth value={settings.site_name || ''} onChange={(event) => handleChange('site_name', event.target.value)} />
                <TextField label="Leader name" fullWidth value={settings.leader_name || ''} onChange={(event) => handleChange('leader_name', event.target.value)} />
                <TextField label="Designation" fullWidth value={settings.designation || ''} onChange={(event) => handleChange('designation', event.target.value)} />
                <TextField label="Constituency" placeholder="e.g. NA-221" fullWidth value={settings.constituency || ''} onChange={(event) => handleChange('constituency', event.target.value)} />
                <TextField label="District / City" fullWidth value={settings.district || ''} onChange={(event) => handleChange('district', event.target.value)} />
                <ImageUpload id="site-logo" label="Website logo" hint="PNG, WebP or SVG with a transparent background." value={settings.logo} aspectRatio="1 / 1" onChange={(file) => handleFileChange('logo', file)} />
              </Box>
            </Box>
          )}

          {activeSection === 'homepage' && (
            <Box role="tabpanel">
              <SectionHeading title="Homepage hero" description="Shape the first impression visitors see when they open the public website." />
              <Box sx={{ ...fieldGridSx, alignItems: 'start' }}>
                <Box sx={{ display: 'grid', gap: 2.25 }}>
                  <TextField label="Site message / tagline" fullWidth multiline minRows={2} value={settings.site_message || ''} onChange={(event) => handleChange('site_message', event.target.value)} />
                  <TextField label="Hero statement" fullWidth multiline minRows={3} value={settings.hero_statement || ''} onChange={(event) => handleChange('hero_statement', event.target.value)} />
                  <TextField label="Introduction" fullWidth multiline minRows={6} value={settings.intro || ''} onChange={(event) => handleChange('intro', event.target.value)} />
                </Box>
                <ImageUpload id="intro-image" label="Hero / introduction image" hint="Use a wide, high-resolution image. Recommended 1600 × 1000 px." value={settings.intro_image} onChange={(file) => handleFileChange('intro_image', file)} />
              </Box>
            </Box>
          )}

          {activeSection === 'about' && (
            <Box role="tabpanel">
              <SectionHeading title="About page" description="Maintain the biography, portrait and public-service record independently from the homepage." />
              <Box sx={{ ...fieldGridSx, alignItems: 'start', mb: 3 }}>
                <TextField label="About biography" fullWidth multiline minRows={9} value={settings.about || ''} onChange={(event) => handleChange('about', event.target.value)} />
                <ImageUpload id="about-image" label="About page image" hint="This image appears only on the About page. A portrait ratio works best." value={settings.about_image} aspectRatio="4 / 5" onChange={(file) => handleFileChange('about_image', file)} />
              </Box>
              <Box sx={fieldGridSx}>
                <TextField label="Achievements / focus areas" fullWidth multiline minRows={7} helperText="Enter one achievement or public focus area per line." value={settings.achievements || ''} onChange={(event) => handleChange('achievements', event.target.value)} />
                <TextField label="Values" fullWidth multiline minRows={7} helperText="Enter each value and its description on separate lines." value={settings.values || ''} onChange={(event) => handleChange('values', event.target.value)} />
                <TextField label="Vision" fullWidth multiline minRows={5} value={settings.vision || ''} onChange={(event) => handleChange('vision', event.target.value)} />
                <TextField label="Mission" fullWidth multiline minRows={5} value={settings.mission || ''} onChange={(event) => handleChange('mission', event.target.value)} />
              </Box>
            </Box>
          )}

          {activeSection === 'contact' && (
            <Box role="tabpanel">
              <SectionHeading title="Office contact and social links" description="Keep public contact channels accurate so citizens can reach the right office." />
              <Box sx={fieldGridSx}>
                <TextField label="Office address" fullWidth multiline minRows={4} sx={{ gridColumn: { md: '1 / -1' } }} value={settings.office_address || ''} onChange={(event) => handleChange('office_address', event.target.value)} />
                <TextField label="Office hours" fullWidth value={settings.office_hours || ''} onChange={(event) => handleChange('office_hours', event.target.value)} />
                <TextField label="Contact email" type="email" fullWidth value={settings.contact_email || ''} onChange={(event) => handleChange('contact_email', event.target.value)} />
                <TextField label="Contact phone" fullWidth value={settings.contact_phone || ''} onChange={(event) => handleChange('contact_phone', event.target.value)} />
                <TextField label="WhatsApp" fullWidth value={settings.whatsapp || ''} onChange={(event) => handleChange('whatsapp', event.target.value)} />
                <TextField label="Facebook URL" fullWidth value={settings.facebook_url || ''} onChange={(event) => handleChange('facebook_url', event.target.value)} />
                <TextField label="X / Twitter URL" fullWidth value={settings.x_url || ''} onChange={(event) => handleChange('x_url', event.target.value)} />
                <TextField label="Instagram URL" fullWidth value={settings.instagram_url || ''} onChange={(event) => handleChange('instagram_url', event.target.value)} />
                <TextField label="YouTube URL" fullWidth value={settings.youtube_url || ''} onChange={(event) => handleChange('youtube_url', event.target.value)} />
                <TextField label="Website URL" fullWidth sx={{ gridColumn: { md: '1 / -1' } }} value={settings.website_url || ''} onChange={(event) => handleChange('website_url', event.target.value)} />
              </Box>
            </Box>
          )}
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, py: 2.5 }}>
        <Typography variant="caption" color="text.secondary">Changes appear after saving.</Typography>
        <Button variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={handleSave}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </Box>
    </Box>
  );
}
