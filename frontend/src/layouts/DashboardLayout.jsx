import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItemButton,
  ListItemIcon, ListItemText, Toolbar, Typography, Avatar, Menu, MenuItem,
  Divider, useMediaQuery, useTheme,
} from '@mui/material';
import { schemeCategoriesAPI } from '../api';
import {
  Dashboard, Group, AccountTree, Settings, Menu as MenuIcon, Logout, Security, Category, ChevronLeft
} from '@mui/icons-material';

const DRAWER_WIDTH = 260;

const STATIC_MENU_ITEMS = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Users', icon: <Group />, path: '/users', module: 'USERS', action: 'view' },
  { text: 'Roles', icon: <Security />, path: '/roles', module: 'ROLES', action: 'view' },
  { text: 'Categories', icon: <Category />, path: '/categories', module: 'CATEGORIES', action: 'view' },
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function DashboardLayout() {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    schemeCategoriesAPI.list().then(res => setCategories(res.data)).catch(console.error);
  }, []);

  const dynamicMenuItems = categories.map(cat => ({
    text: `${cat.name} Schemes`,
    icon: <AccountTree />,
    path: `/schemes/${cat.slug.toLowerCase()}`,
    module: cat.slug.toUpperCase(),
    action: 'view'
  }));

  const MENU_ITEMS = [
    ...STATIC_MENU_ITEMS.slice(0, 4), // Dashboard, Users, Roles, Categories
    ...dynamicMenuItems,
    STATIC_MENU_ITEMS[4] // Settings
  ];
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNav = MENU_ITEMS.filter(item =>
    !item.module || hasPermission(item.module, item.action)
  );

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo area */}
      <Box sx={{
        p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5,
        background: 'linear-gradient(135deg, #0D3B0F 0%, #1B5E20 100%)',
      }}>
        <Box sx={{
          width: 42, height: 42, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.4rem', fontWeight: 900, color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          N
        </Box>
        <Box>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
            Naveed Qamar
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.75rem', fontWeight: 500 }}>
            Official Portal
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)} sx={{ ml: 'auto', color: '#fff' }}>
            <ChevronLeft />
          </IconButton>
        )}
      </Box>

      {/* Nav items */}
      <List sx={{ px: 1.5, pt: 2, flex: 1 }}>
        {filteredNav.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setDrawerOpen(false);
              }}
              sx={{
                borderRadius: 2, mb: 0.5, py: 1.2,
                backgroundColor: isActive ? 'rgba(27,94,32,0.08)' : 'transparent',
                color: isActive ? 'primary.main' : 'text.secondary',
                '&:hover': { backgroundColor: 'rgba(27,94,32,0.06)' },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{
                minWidth: 40, color: isActive ? 'primary.main' : 'text.secondary',
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{ fontWeight: isActive ? 600 : 400, fontSize: '0.9rem' }}
              />
              {isActive && (
                <Box sx={{
                  width: 4, height: 24, borderRadius: 2,
                  background: 'linear-gradient(180deg, #1B5E20 0%, #4CAF50 100%)',
                }} />
              )}
            </ListItemButton>
          );
        })}
      </List>

      {/* User card at bottom */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
            fontSize: '0.85rem', fontWeight: 600,
          }}>
            {user?.name?.charAt(0) || 'A'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>{user?.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap>{user?.role}</Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <CssBaseline />

      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setDrawerOpen(true)} edge="start">
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" color="text.primary" fontWeight={600}>
              {filteredNav.find(n => n.path === location.pathname)?.text || 'Dashboard'}
            </Typography>
          </Box>
          <Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Avatar sx={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg, #1B5E20, #4CAF50)',
                fontSize: '0.8rem', fontWeight: 600,
              }}>
                {user?.name?.charAt(0) || 'A'}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem disabled>
                <Typography variant="body2" fontWeight={600}>{user?.name}</Typography>
              </MenuItem>
              <MenuItem disabled>
                <Typography variant="caption" color="text.secondary">{user?.email}</Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate('/settings'); }}>
                <Settings fontSize="small" sx={{ mr: 1 }} /> Settings
              </MenuItem>
              <MenuItem onClick={() => { setAnchorEl(null); handleLogout(); }} sx={{ color: 'error.main' }}>
                <Logout fontSize="small" sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: '2px 0 8px rgba(0,0,0,0.04)',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: '64px',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
