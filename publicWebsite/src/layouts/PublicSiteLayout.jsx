import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  LinearProgress,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AlternateEmail,
  Facebook,
  Instagram,
  Phone,
  YouTube,
} from '@mui/icons-material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { publicSettingsAPI } from '../api/index.js';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'News Updates', path: '/news' },
  { label: 'Complaints', path: '/complaints' },
];

export default function PublicSiteLayout() {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await publicSettingsAPI.current();
        if (active) {
          setSettings(response.data || {});
        }
      } catch (error) {
        console.error(error);
        if (active) {
          setSettings({});
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const socialLinks = useMemo(
    () =>
      [
        { href: settings?.facebook_url, icon: <Facebook fontSize="small" />, label: 'Facebook' },
        { href: settings?.instagram_url, icon: <Instagram fontSize="small" />, label: 'Instagram' },
        { href: settings?.x_url, icon: <AlternateEmail fontSize="small" />, label: 'X' },
        { href: settings?.youtube_url, icon: <YouTube fontSize="small" />, label: 'YouTube' },
      ].filter((item) => item.href),
    [settings],
  );

  return (
    <Box sx={{ minHeight: '100vh', color: 'text.primary', position: 'relative' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: 12,
          top: -48,
          px: 2,
          py: 1,
          borderRadius: 999,
          bgcolor: 'primary.main',
          color: 'white',
          zIndex: 20,
          '&:focus': { top: 12 },
        }}
      >
        Skip to content
      </Box>

      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            borderBottom: '1px solid rgba(16,36,27,0.08)',
            bgcolor: alpha('#fffdfa', 0.94),
          }}
        >
          <Container>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', md: 'center' }}
              sx={{ py: 1.1 }}
            >
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Official Website of a Member of the National Assembly, Pakistan
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ color: 'text.secondary' }}>
                {settings?.contact_phone && (
                  <Typography variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                    <Phone sx={{ fontSize: 16 }} /> {settings.contact_phone}
                  </Typography>
                )}
                {settings?.contact_email && (
                  <Typography variant="body2" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6 }}>
                    <AlternateEmail sx={{ fontSize: 16 }} /> {settings.contact_email}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Container>
        </Box>

        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(253, 251, 247, 0.92)',
            backdropFilter: 'blur(16px)',
            borderBottom: '1px solid rgba(16,36,27,0.08)',
          }}
        >
          <Container>
            <Toolbar disableGutters sx={{ py: 1.7, gap: 2, justifyContent: 'space-between' }}>
              <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.6, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'primary.main',
                    color: 'white',
                    fontFamily: '"Newsreader", "Georgia", serif',
                    fontSize: '1.18rem',
                    fontWeight: 800,
                    boxShadow: '0 12px 28px rgba(16,36,27,0.18)',
                    flexShrink: 0,
                  }}
                >
                  {settings?.leader_name?.trim()?.charAt(0) || settings?.site_name?.trim()?.charAt(0) || 'M'}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                    {settings?.leader_name || settings?.site_name || 'MNA Portal'}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {settings?.designation || 'Member of the National Assembly'}
                  </Typography>
                </Box>
              </Box>

              <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap justifyContent="flex-end">
                {navItems.map((item) => {
                  const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <Button
                      key={item.path}
                      component={RouterLink}
                      to={item.path}
                      color="inherit"
                      sx={{
                        color: active ? 'primary.main' : 'text.primary',
                        bgcolor: active ? alpha('#1f5f46', 0.08) : 'transparent',
                        px: 1.8,
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
                <Button component={RouterLink} to="/complaints" variant="contained" color="secondary">
                  Get in Touch
                </Button>
              </Stack>
            </Toolbar>
          </Container>
          {loading && <LinearProgress color="secondary" />}
        </AppBar>

        <Box component="main" id="main-content">
          <Outlet context={{ settings: settings || {} }} />
        </Box>

        <Box component="footer" sx={{ mt: 10, pt: 7, pb: 4, bgcolor: '#153426', color: 'white' }}>
          <Container>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1fr 0.8fr 1fr' },
                gap: 4,
                alignItems: 'start',
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ color: 'white', mb: 1.3 }}>
                  {settings?.leader_name || settings?.site_name || 'MNA Portal'}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.78)', maxWidth: 560 }}>
                  {settings?.hero_statement ||
                    settings?.site_message ||
                    'Serving the people with accessible representation, transparent communication, and accountable public service.'}
                </Typography>
                {socialLinks.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 2.2 }}>
                    {socialLinks.map((item) => (
                      <IconButton
                        key={item.label}
                        component="a"
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={item.label}
                        sx={{
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.16)',
                          bgcolor: 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {item.icon}
                      </IconButton>
                    ))}
                  </Stack>
                )}
              </Box>

              <Box>
                <Typography variant="overline" sx={{ color: '#d8b06a' }}>
                  Quick Access
                </Typography>
                {navItems.map((item) => (
                  <Typography key={item.path} component={RouterLink} to={item.path} sx={{ display: 'block', mt: 1.1, color: 'rgba(255,255,255,0.82)' }}>
                    {item.label}
                  </Typography>
                ))}
              </Box>

              <Box>
                <Typography variant="overline" sx={{ color: '#d8b06a' }}>
                  Office Information
                </Typography>
                {settings?.constituency && (
                  <Typography sx={{ mt: 1.1, color: 'rgba(255,255,255,0.78)' }}>
                    Constituency: {settings.constituency}
                  </Typography>
                )}
                {settings?.office_address && (
                  <Typography sx={{ mt: 1.1, color: 'rgba(255,255,255,0.78)', whiteSpace: 'pre-wrap' }}>
                    {settings.office_address}
                  </Typography>
                )}
                {settings?.office_hours && (
                  <Typography sx={{ mt: 1.1, color: 'rgba(255,255,255,0.78)' }}>
                    Office Hours: {settings.office_hours}
                  </Typography>
                )}
              </Box>
            </Box>
            <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.12)' }} />
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.58)' }}>
              Built for the people: complaints, feedback, public updates, and direct access to the office in one place.
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  );
}
