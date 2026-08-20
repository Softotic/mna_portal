import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { LinearProgress } from '@mui/material';
import { AuthProvider } from './auth/AuthContext';
import { AdminFeedbackProvider } from './feedback/AdminFeedbackContext';
import ProtectedRoute from './auth/ProtectedRoute';
import theme from './theme/theme';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const UsersPage = lazy(() => import('./pages/UsersPage'));
const SchemesPage = lazy(() => import('./pages/SchemesPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SchemeTemplateDetailPage = lazy(() => import('./pages/SchemeTemplateDetailPage'));
const PublicWebsiteSettingsPage = lazy(() => import('./pages/PublicWebsiteSettingsPage'));
const NewsManagementPage = lazy(() => import('./pages/NewsManagementPage'));
const ComplaintsManagementPage = lazy(() => import('./pages/ComplaintsManagementPage'));
const FeedbackManagementPage = lazy(() => import('./pages/FeedbackManagementPage'));
const TeamManagementPage = lazy(() => import('./pages/TeamManagementPage'));
const PortfolioSchemesManagementPage = lazy(() => import('./pages/PortfolioSchemesManagementPage'));

function App() {
  const basename = window.location.pathname.startsWith('/admin') ? '/admin' : '';

  return (
    <ThemeProvider theme={theme}>
      <AdminFeedbackProvider>
        <AuthProvider>
          <BrowserRouter basename={basename}>
          <Suspense fallback={<LinearProgress aria-label="Loading page" sx={{ position: 'fixed', inset: '0 0 auto', zIndex: 'tooltip' }} />}>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Admin Routes */}
            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route 
                path="users" 
                element={
                  <ProtectedRoute module="USERS" action="view">
                    <UsersPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="schemes" 
                element={
                  <ProtectedRoute module="SCHEMES" action="view">
                    <SchemesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="schemes/:category_slug" 
                element={
                  <ProtectedRoute module="SCHEMES" action="view">
                    <SchemesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="schemes/:category_slug/:template_id" 
                element={
                  <ProtectedRoute module="SCHEMES" action="view">
                    <SchemeTemplateDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route 
                path="roles" 
                element={
                  <ProtectedRoute module="ROLES" action="view">
                    <RolesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="categories" 
                element={
                  <ProtectedRoute module="CATEGORIES" action="view">
                    <CategoriesPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="settings" element={<SettingsPage />} />
              
              {/* Public Website Management Routes */}
              <Route 
                path="website-settings" 
                element={<PublicWebsiteSettingsPage />} 
              />
              <Route 
                path="news-management" 
                element={<NewsManagementPage />} 
              />
              <Route
                path="feedback-management"
                element={<FeedbackManagementPage />}
              />
              <Route
                path="team-management"
                element={<TeamManagementPage />}
              />
              <Route
                path="portfolio-schemes"
                element={<PortfolioSchemesManagementPage />}
              />
              <Route 
                path="complaints-management"
                element={<ComplaintsManagementPage />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </AdminFeedbackProvider>
    </ThemeProvider>
  );
}

export default App;
