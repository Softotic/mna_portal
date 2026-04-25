import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import PublicLandingPage from './pages/PublicLandingPage.jsx';
import PublicNewsPage from './pages/PublicNewsPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box>
              <Typography component={Link} to="/" sx={{ textDecoration: 'none', color: '#1a1a1a', fontWeight: 700, fontSize: '1.1rem' }}>
                MNA
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/" color="inherit" sx={{ textTransform: 'none' }}>
                Home
              </Button>
              <Button component={Link} to="/news" color="inherit" sx={{ textTransform: 'none' }}>
                News
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/news" element={<PublicNewsPage />} />
        <Route path="*" element={<Typography sx={{ p: 8, textAlign: 'center' }}>Page not found.</Typography>} />
      </Routes>
    </BrowserRouter>
  );
}
