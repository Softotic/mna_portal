import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../auth/AuthContext';
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { schemeCategoriesAPI } from '../api';
import {
  AccountTreeOutlined,
  CategoryOutlined,
  ChevronLeft,
  DashboardOutlined,
  ExpandMore,
  ForumOutlined,
  GroupOutlined,
  LanguageOutlined,
  LogoutOutlined,
  Menu as MenuIcon,
  NewspaperOutlined,
  SecurityOutlined,
  SettingsOutlined,
  TuneOutlined,
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { text: 'Dashboard', icon: DashboardOutlined, path: '/dashboard' },
      { text: 'Categories', icon: CategoryOutlined, path: '/categories', module: 'CATEGORIES', action: 'view' },
    ],
  },
  {
    label: 'Public website',
    items: [
      { text: 'News Management', icon: NewspaperOutlined, path: '/news-management' },
      { text: 'Feedback Management', icon: ForumOutlined, path: '/feedback-management' },
      { text: 'Team Management', icon: GroupOutlined, path: '/team-management' },
      { text: 'Portfolio Schemes', icon: AccountTreeOutlined, path: '/portfolio-schemes' },
      { text: 'Complaints Management', icon: TuneOutlined, path: '/complaints-management' },
    ],
  },
  {
    label: 'Security',
    items: [
      { text: 'Users', icon: GroupOutlined, path: '/users', module: 'USERS', action: 'view' },
      { text: 'Roles', icon: SecurityOutlined, path: '/roles', module: 'ROLES', action: 'view' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { text: 'Public Website Settings', icon: LanguageOutlined, path: '/website-settings' },
      { text: 'Admin Portal Settings', icon: SettingsOutlined, path: '/settings' },
    ],
  },
];

export default function DashboardLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [categories, setCategories] = useState([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    schemeCategoriesAPI.list()
      .then((response) => setCategories(response.data))
      .catch((error) => console.error('Unable to load scheme navigation', error));
  }, []);

  const schemeItems = useMemo(
    () => categories.map((category) => ({
      text: `${category.name} Schemes`,
      icon: AccountTreeOutlined,
      path: `/schemes/${category.slug.toLowerCase()}`,
      module: category.slug.toUpperCase(),
      action: 'view',
    })),
    [categories],
  );

  const groups = useMemo(() => {
    const nextGroups = [...NAV_GROUPS];
    if (schemeItems.length) {
      nextGroups.splice(1, 0, { label: 'Scheme registers', items: schemeItems });
    }
    return nextGroups.map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.module || hasPermission(item.module, item.action)),
    })).filter((group) => group.items.length);
  }, [hasPermission, schemeItems]);

  const allItems = groups.flatMap((group) => group.items);
  const activeItem = allItems
    .filter((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];

  const goTo = (path) => {
    navigate(path);
    if (isMobile) setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#FAFCFB' }}>
      <Box sx={{ minHeight: 72, px: 2.25, display: 'flex', alignItems: 'center', gap: 1.4 }}>
        <Box
          aria-hidden="true"
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'grid',
            placeItems: 'center',
            fontWeight: 800,
            letterSpacing: '-0.04em',
          }}
        >
          MNA
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" noWrap sx={{ color: 'text.primary', lineHeight: 1.25 }}>
            Naveed Qamar
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Administration portal
          </Typography>
        </Box>
        {isMobile && (
          <IconButton aria-label="Close navigation" onClick={() => setDrawerOpen(false)} sx={{ ml: 'auto' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      <Divider />

      <List
        component="nav"
        aria-label="Administration navigation"
        sx={{ px: 1.5, py: 1.5, flex: 1, overflowY: 'auto' }}
      >
        {groups.map((group, groupIndex) => (
          <Box key={group.label} sx={{ mb: groupIndex === groups.length - 1 ? 0 : 1.25 }}>
            <ListSubheader
              disableSticky
              sx={{
                px: 1.25,
                py: 0.5,
                bgcolor: 'transparent',
                color: 'text.secondary',
                fontSize: '0.7rem',
                fontWeight: 750,
                lineHeight: 1.8,
              }}
            >
              {group.label}
            </ListSubheader>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeItem?.path === item.path;
              return (
                <ListItemButton
                  key={item.path}
                  selected={isActive}
                  onClick={() => goTo(item.path)}
                  sx={{
                    minHeight: 43,
                    borderRadius: 2.25,
                    px: 1.25,
                    mb: 0.25,
                    color: isActive ? 'primary.dark' : 'text.secondary',
                    '&.Mui-selected': {
                      bgcolor: (currentTheme) => alpha(currentTheme.palette.primary.main, 0.1),
                      '&:hover': { bgcolor: (currentTheme) => alpha(currentTheme.palette.primary.main, 0.14) },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
                    <Icon sx={{ fontSize: 20 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    slotProps={{ primary: { fontSize: '0.84rem', fontWeight: isActive ? 700 : 560, noWrap: true } }}
                  />
                </ListItemButton>
              );
            })}
          </Box>
        ))}
      </List>

      <Box sx={{ p: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <ListItemButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={Boolean(anchorEl)}
          sx={{ borderRadius: 2.25, px: 1.25, minHeight: 56 }}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.82rem', fontWeight: 750 }}>
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </Avatar>
          <ListItemText
            sx={{ ml: 1.25, minWidth: 0 }}
            primary={user?.name || 'Administrator'}
            secondary={user?.role || 'Admin account'}
            slotProps={{
              primary: { fontSize: '0.82rem', fontWeight: 680, noWrap: true },
              secondary: { fontSize: '0.72rem', noWrap: true },
            }}
          />
          <ExpandMore fontSize="small" color="action" />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <CssBaseline />

      <Box
        aria-hidden="true"
        sx={{
          position: 'fixed',
          inset: '0 0 auto 0',
          height: 3,
          bgcolor: 'primary.main',
          transformOrigin: 'left center',
          transform: 'scaleX(0)',
          animation: 'admin-scroll-progress linear both',
          animationTimeline: 'scroll(root block)',
          zIndex: 'tooltip',
          '@keyframes admin-scroll-progress': { to: { transform: 'scaleX(1)' } },
          '@media (prefers-reduced-motion: reduce)': { display: 'none' },
        }}
      />

      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255,255,255,0.94)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '@supports (backdrop-filter: blur(12px))': {
            bgcolor: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(12px) saturate(130%)',
          },
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, sm: 64 }, px: { xs: 2, sm: 3, lg: 4 } }}>
          {isMobile && (
            <IconButton aria-label="Open navigation" onClick={() => setDrawerOpen(true)} edge="start" sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Administration
            </Typography>
            <Typography component="p" variant="subtitle1" noWrap>
              {activeItem?.text || 'Dashboard'}
            </Typography>
          </Box>
          <Tooltip title="Account menu">
            <IconButton onClick={(event) => setAnchorEl(event.currentTarget)} aria-label="Open account menu">
              <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', fontSize: '0.8rem', fontWeight: 750 }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={() => setDrawerOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        id="main-content"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          pt: { xs: '84px', sm: '92px' },
          px: { xs: 2, sm: 3, lg: 4 },
          pb: { xs: 4, md: 6 },
          '& > *': { maxWidth: 1500, mx: 'auto' },
        }}
      >
        <Outlet />
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        slotProps={{ paper: { sx: { width: 230, mt: 0.75 } } }}
      >
        <Box sx={{ px: 2, py: 1.25 }}>
          <Typography variant="subtitle2" noWrap>{user?.name || 'Administrator'}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { setAnchorEl(null); goTo('/settings'); }}>
          <SettingsOutlined fontSize="small" sx={{ mr: 1.25 }} /> Account settings
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }} sx={{ color: 'error.main' }}>
          <LogoutOutlined fontSize="small" sx={{ mr: 1.25 }} /> Sign out
        </MenuItem>
      </Menu>
    </Box>
  );
}
