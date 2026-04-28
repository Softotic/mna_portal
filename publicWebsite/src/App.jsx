import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppBar, Box, Button, Container, CssBaseline, Toolbar, Typography } from '@mui/material';
import PublicLandingPage from './pages/PublicLandingPage.jsx';
import PublicNewsPage from './pages/PublicNewsPage.jsx';
import PublicNewsDetailPage from './pages/PublicNewsDetailPage.jsx';
import PublicComplaintPage from './pages/PublicComplaintPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <CssBaseline />
      <AppBar position="static" elevation={0} sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #e0e0e0' }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
            <Box>
              <Typography component={Link} to="/" sx={{ textDecoration: 'none', color: '#1a1a1a', fontWeight: 700, fontSize: '1.25rem' }}>
                MNA Portal
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button component={Link} to="/" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Home
              </Button>
              <Button component={Link} to="/news" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                News
              </Button>
              <Button component={Link} to="/complaints" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Complaints
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Routes>
        <Route path="/" element={<PublicLandingPage />} />
        <Route path="/news" element={<PublicNewsPage />} />
        <Route path="/news/:id" element={<PublicNewsDetailPage />} />
        <Route path="/complaints" element={<PublicComplaintPage />} />
        <Route path="*" element={<Typography sx={{ p: 8, textAlign: 'center' }}>Page not found.</Typography>} />
      </Routes>
    </BrowserRouter>
  );
}
