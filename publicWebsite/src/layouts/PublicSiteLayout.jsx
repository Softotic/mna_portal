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
  { label: 'News Updates', path: '/news' },
  { label: 'Complaints', path: '/complaints' },
];

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

  const brandName = settings?.leader_name || settings?.site_name || 'MNA Portal';
  const brandSubline = settings?.designation || 'Member of the National Assembly';
  const brandInitial = brandName.trim().charAt(0) || 'M';
  const logoUrl = resolveMediaUrl(settings?.logo);

  const navLinks = (
    <>
      {navItems.map((item) => {
        const active = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Button
            key={item.path}
            component={RouterLink}
            to={item.path}
            color="inherit"
            onClick={() => setNavOpen(false)}
            sx={{
              color: active ? 'primary.main' : 'text.primary',
              bgcolor: active ? alpha('#1f5f46', 0.08) : 'transparent',
              px: 1.8,
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </Button>
        );
      })}
      <Button component={RouterLink} to="/complaints" variant="contained" color="secondary" onClick={() => setNavOpen(false)}>
        Get in Touch
      </Button>
    </>
  );

  return (
    <Box sx={{ minHeight: '100vh', color: 'text.primary', position: 'relative', overflowX: 'hidden' }}>
      {/* <Box
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
      </Box> */}

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
              spacing={{ xs: 0.6, md: 1.5 }}
              sx={{
                py: { xs: 0.8, md: 1.1 },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', md: 'center' },
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  color: 'text.secondary',
                  display: { xs: 'none', sm: 'block' },
                  fontSize: { sm: '0.66rem', md: '0.75rem' },
                  overflowWrap: 'anywhere',
                }}
              >
                Official Website of a Member of the National Assembly, Pakistan
              </Typography>
              <Stack direction="row" spacing={{ xs: 1, sm: 2 }} useFlexGap sx={{ color: 'text.secondary', flexWrap: 'wrap' }}>
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
            <Toolbar disableGutters sx={{ py: { xs: 1, md: 1.5 }, gap: 2, justifyContent: 'space-between' }}>
              <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', gap: 1.6, minWidth: 0 }}>
                {logoUrl ? (
                  <Box
                    component="img"
                    src={logoUrl}
                    alt={`${brandName} logo`}
                    sx={{
                      width: { xs: 42, md: 52 },
                      height: { xs: 42, md: 52 },
                      borderRadius: 2,
                      bgcolor: 'white',
                      boxShadow: '0 12px 28px rgba(16,36,27,0.18)',
                      objectFit: 'contain',
                      p: 0.7,
                      flexShrink: 0,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: { xs: 42, md: 52 },
                      height: { xs: 42, md: 52 },
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
                    {brandInitial}
                  </Box>
                )}
                <Box sx={{ minWidth: 0, maxWidth: { xs: 'calc(100vw - 118px)', md: 'none' } }}>
                  <Typography sx={{ fontWeight: 800, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis',

                    color: 'text.primary'
                   }}>
                    {brandName}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      color: 'text.secondary',
                      letterSpacing: '0.15em',
                      textTransform: 'uppercase',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {brandSubline}
                  </Typography>
                </Box>
              </Box>

              <Stack
                direction="row"
                spacing={0.7}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                }}
              >
                {navLinks}
              </Stack>

              <IconButton
                aria-label="Open navigation"
                onClick={() => setNavOpen(true)}
                sx={{ display: { xs: 'inline-flex', md: 'none' }, border: '1px solid rgba(31,95,70,0.16)' }}
              >
                <Menu />
              </IconButton>
            </Toolbar>
          </Container>
          {loading && <LinearProgress color="secondary" />}
        </AppBar>

        <Drawer anchor="right" open={navOpen} onClose={() => setNavOpen(false)}>
          <Box sx={{ width: 300, maxWidth: '86vw', p: 2.2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="h6">{brandName}</Typography>
              <IconButton aria-label="Close navigation" onClick={() => setNavOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            <List>
              {navItems.map((item) => (
                <ListItemButton key={item.path} component={RouterLink} to={item.path} onClick={() => setNavOpen(false)}>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              ))}
            </List>
            <Button component={RouterLink} to="/complaints" variant="contained" color="secondary" fullWidth onClick={() => setNavOpen(false)}>
              Get in Touch
            </Button>
          </Box>
        </Drawer>

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
                <Stack direction="row" spacing={1.4} sx={{ mb: 1.3, alignItems: 'center' }}>
                  {logoUrl && (
                    <Box
                      component="img"
                      src={logoUrl}
                      alt={`${brandName} logo`}
                      sx={{ width: 46, height: 46, objectFit: 'contain', borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.94)', p: 0.5 }}
                    />
                  )}
                  <Typography variant="h6" sx={{ color: 'white' }}>
                    {brandName}
                  </Typography>
                </Stack>
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
