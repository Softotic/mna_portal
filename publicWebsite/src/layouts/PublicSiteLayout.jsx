import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AlternateEmail,
  ArrowOutward,
  Close,
  Facebook,
  Instagram,
  Menu,
  Phone,
  YouTube,
} from '@mui/icons-material';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import { publicSettingsAPI, resolveMediaUrl } from '../api/index.js';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Team', path: '/team' },
  { label: 'Schemes', path: '/schemes' },
  { label: 'News', path: '/news' },
  { label: 'Complaints', path: '/complaints' },
];

function isActivePath(pathname, path) {
  return pathname === path || (path !== '/' && pathname.startsWith(path));
}

function cleanDisplayText(value) {
  return String(value || '').replace(/[\u2013\u2014]/g, '-');
}

function cleanLeaderName(value) {
  return cleanDisplayText(value).replace(/^about\s+/i, '').trim();
}

export default function PublicSiteLayout() {
  const location = useLocation();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await publicSettingsAPI.current();
        if (active) setSettings(response.data || {});
      } catch (error) {
        console.error(error);
        if (active) setSettings({});
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname]);

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

  const brandName = cleanLeaderName(settings?.leader_name || settings?.site_name || 'MNA Portal');
  const brandSubline = cleanDisplayText(settings?.designation || 'Member of the National Assembly');
  const brandInitial = brandName.trim().charAt(0) || 'M';
  const logoUrl = resolveMediaUrl(settings?.logo);

  return (
    <Box sx={{ minHeight: '100dvh', color: 'text.primary', position: 'relative', overflowX: 'hidden' }}>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'fixed',
          left: 16,
          top: 12,
          transform: 'translateY(-150%)',
          px: 2.2,
          py: 1.1,
          borderRadius: 999,
          bgcolor: 'secondary.main',
          color: 'secondary.contrastText',
          fontWeight: 800,
          zIndex: 'tooltip',
          transition: 'transform 180ms var(--site-ease)',
          '&:focus': { transform: 'translateY(0)' },
        }}
      >
        Skip to content
      </Box>

      <Box
        sx={{
          bgcolor: 'primary.dark',
          color: 'rgba(248,251,249,0.88)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Container>
          <Stack
            direction="row"
            spacing={2}
            sx={{ minHeight: 36, justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Typography sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.75rem', fontWeight: 650 }}>
              Official public website of a Member of the National Assembly, Pakistan
            </Typography>
            <Stack direction="row" spacing={{ xs: 1.4, sm: 2.4 }} sx={{ ml: { xs: 'auto', sm: 0 } }}>
              {settings?.contact_phone && (
                <Typography
                  component="a"
                  href={`tel:${settings.contact_phone}`}
                  sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.7, fontSize: '0.75rem', fontWeight: 650 }}
                >
                  <Phone sx={{ fontSize: 15 }} />
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>{settings.contact_phone}</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>Call office</Box>
                </Typography>
              )}
              {settings?.contact_email && (
                <Typography
                  component="a"
                  href={`mailto:${settings.contact_email}`}
                  sx={{ display: { xs: 'none', md: 'inline-flex' }, alignItems: 'center', gap: 0.7, fontSize: '0.75rem', fontWeight: 650 }}
                >
                  <AlternateEmail sx={{ fontSize: 15 }} /> {settings.contact_email}
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
          bgcolor: alpha('#f8faf8', 0.94),
          color: 'text.primary',
          backdropFilter: 'blur(14px) saturate(130%)',
          borderBottom: '1px solid',
          borderColor: alpha('#176044', 0.14),
        }}
      >
        <Container>
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 }, gap: 2, justifyContent: 'space-between' }}>
            <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.35, minWidth: 0 }}>
              {logoUrl ? (
                <Box
                  component="img"
                  src={logoUrl}
                  alt={`${brandName} logo`}
                  sx={{
                    width: { xs: 42, md: 46 },
                    height: { xs: 42, md: 46 },
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    objectFit: 'contain',
                    p: 0.55,
                    flexShrink: 0,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: { xs: 42, md: 46 },
                    height: { xs: 42, md: 46 },
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {brandInitial}
                </Box>
              )}
              <Box sx={{ minWidth: 0, maxWidth: { xs: 'calc(100vw - 124px)', lg: 260 } }}>
                <Typography sx={{ fontWeight: 800, lineHeight: 1.08, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {brandName}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ display: 'block', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {brandSubline}
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={0.1} sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
              {navItems.map((item) => {
                const active = isActivePath(location.pathname, item.path);
                return (
                  <Button
                    key={item.path}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    aria-current={active ? 'page' : undefined}
                    sx={{
                      minWidth: 'auto',
                      px: { md: 1.15, lg: 1.5 },
                      color: active ? 'primary.main' : 'text.primary',
                      position: 'relative',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        left: 18,
                        right: 18,
                        bottom: 4,
                        height: 2,
                        borderRadius: 99,
                        bgcolor: active ? 'secondary.main' : 'transparent',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
              <Button component={RouterLink} to="/complaints" variant="contained" color="primary" sx={{ ml: 1 }}>
                Submit complaint
              </Button>
            </Stack>

            <IconButton
              aria-label="Open navigation"
              aria-expanded={navOpen}
              onClick={() => setNavOpen(true)}
              sx={{ display: { xs: 'inline-flex', md: 'none' }, border: '1px solid', borderColor: 'divider' }}
            >
              <Menu />
            </IconButton>
          </Toolbar>
        </Container>
        {loading && <LinearProgress color="secondary" />}
      </AppBar>

      <Drawer
        anchor="right"
        open={navOpen}
        onClose={() => setNavOpen(false)}
        slotProps={{ paper: { sx: { width: 340, maxWidth: '90vw', bgcolor: 'background.default' } } }}
      >
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Box>
              <Typography variant="h6">{brandName}</Typography>
              <Typography variant="body2" color="text.secondary">Public service portal</Typography>
            </Box>
            <IconButton aria-label="Close navigation" onClick={() => setNavOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <List disablePadding sx={{ mb: 2.5 }}>
            {navItems.map((item) => {
              const active = isActivePath(location.pathname, item.path);
              return (
                <ListItemButton
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  selected={active}
                  sx={{ borderRadius: 2, minHeight: 48, mb: 0.5 }}
                >
                  <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: active ? 800 : 600 } } }} />
                </ListItemButton>
              );
            })}
          </List>
          <Button component={RouterLink} to="/complaints" variant="contained" fullWidth endIcon={<ArrowOutward />}>
            Submit complaint
          </Button>
        </Box>
      </Drawer>

      <Box component="main" id="main-content">
        <Outlet context={{ settings: settings || {} }} />
      </Box>

      <Box component="footer" sx={{ mt: { xs: 8, md: 12 }, pt: { xs: 6, md: 8 }, pb: 4, bgcolor: 'primary.dark', color: '#f5faf7' }}>
        <Container>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.25fr) 0.7fr 0.9fr' }, gap: { xs: 5, md: 7 } }}>
            <Box>
              <Typography variant="h5" sx={{ color: 'inherit', maxWidth: 520 }}>{brandName}</Typography>
              <Typography sx={{ mt: 1.5, color: 'rgba(245,250,247,0.76)', maxWidth: 560 }}>
                {cleanDisplayText(settings?.site_message || 'Accessible representation, clear public information, and accountable constituency service.')}
              </Typography>
              {socialLinks.length > 0 && (
                <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
                  {socialLinks.map((item) => (
                    <IconButton
                      key={item.label}
                      component="a"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={item.label}
                      sx={{ color: 'inherit', border: '1px solid rgba(255,255,255,0.22)' }}
                    >
                      {item.icon}
                    </IconButton>
                  ))}
                </Stack>
              )}
            </Box>

            <Box component="nav" aria-label="Footer navigation">
              <Typography sx={{ fontWeight: 800, mb: 1.4 }}>Explore</Typography>
              {navItems.map((item) => (
                <Typography
                  key={item.path}
                  component={RouterLink}
                  to={item.path}
                  sx={{ display: 'block', py: 0.55, color: 'rgba(245,250,247,0.78)', '&:hover': { color: 'secondary.light' } }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 800, mb: 1.4 }}>Office</Typography>
              {settings?.constituency && <Typography sx={{ color: 'rgba(245,250,247,0.78)', mb: 1 }}>Constituency: {settings.constituency}</Typography>}
              {settings?.office_address && <Typography sx={{ color: 'rgba(245,250,247,0.78)', whiteSpace: 'pre-wrap', mb: 1 }}>{settings.office_address}</Typography>}
              {settings?.office_hours && <Typography sx={{ color: 'rgba(245,250,247,0.78)' }}>Hours: {settings.office_hours}</Typography>}
            </Box>
          </Box>
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.14)' }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ justifyContent: 'space-between' }}>
            <Typography variant="body2" sx={{ color: 'rgba(245,250,247,0.62)' }}>
              Official constituency public service portal
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(245,250,247,0.62)' }}>
              Pakistan
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
