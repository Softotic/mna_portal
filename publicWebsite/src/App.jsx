import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, ThemeProvider, Typography } from '@mui/material';
import PublicLandingPage from './pages/PublicLandingPage.jsx';
import PublicNewsPage from './pages/PublicNewsPage.jsx';
import PublicNewsDetailPage from './pages/PublicNewsDetailPage.jsx';
import PublicComplaintPage from './pages/PublicComplaintPage.jsx';
import PublicSiteLayout from './layouts/PublicSiteLayout.jsx';
import theme from './theme.js';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicSiteLayout />}>
            <Route index element={<PublicLandingPage />} />
            <Route path="news" element={<PublicNewsPage />} />
            <Route path="news/:id" element={<PublicNewsDetailPage />} />
            <Route path="complaints" element={<PublicComplaintPage />} />
            <Route
              path="*"
              element={<Typography sx={{ p: 8, textAlign: 'center' }}>Page not found.</Typography>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
