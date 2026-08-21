import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CssBaseline, LinearProgress, ThemeProvider, Typography } from '@mui/material';
import PublicLandingPage from './pages/PublicLandingPage.jsx';
import PublicSiteLayout from './layouts/PublicSiteLayout.jsx';
import theme from './theme.js';

const PublicNewsPage = lazy(() => import('./pages/PublicNewsPage.jsx'));
const PublicNewsDetailPage = lazy(() => import('./pages/PublicNewsDetailPage.jsx'));
const PublicComplaintPage = lazy(() => import('./pages/PublicComplaintPage.jsx'));
const PublicTeamPage = lazy(() => import('./pages/PublicTeamPage.jsx'));
const PublicAboutPage = lazy(() => import('./pages/PublicAboutPage.jsx'));
const PublicSchemesPage = lazy(() => import('./pages/PublicSchemesPage.jsx'));
const PublicSchemeDetailPage = lazy(() => import('./pages/PublicSchemeDetailPage.jsx'));

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<LinearProgress color="secondary" />}>
          <Routes>
            <Route path="/" element={<PublicSiteLayout />}>
              <Route index element={<PublicLandingPage />} />
              <Route path="about" element={<PublicAboutPage />} />
              <Route path="team" element={<PublicTeamPage />} />
              <Route path="schemes" element={<PublicSchemesPage />} />
              <Route path="schemes/:id" element={<PublicSchemeDetailPage />} />
              <Route path="news" element={<PublicNewsPage />} />
              <Route path="news/:id" element={<PublicNewsDetailPage />} />
              <Route path="complaints" element={<PublicComplaintPage />} />
              <Route
                path="*"
                element={<Typography sx={{ p: 8, textAlign: 'center' }}>Page not found.</Typography>}
              />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}
