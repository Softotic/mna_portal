import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
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
const UnionCouncilsPage = lazy(() => import('./pages/UnionCouncilsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const SchemeTemplateDetailPage = lazy(() => import('./pages/SchemeTemplateDetailPage'));
const PublicWebsiteSettingsPage = lazy(() => import('./pages/PublicWebsiteSettingsPage'));
const NewsManagementPage = lazy(() => import('./pages/NewsManagementPage'));
const ComplaintsManagementPage = lazy(() => import('./pages/ComplaintsManagementPage'));
const FeedbackManagementPage = lazy(() => import('./pages/FeedbackManagementPage'));
const TeamManagementPage = lazy(() => import('./pages/TeamManagementPage'));
const PortfolioSchemesManagementPage = lazy(() => import('./pages/PortfolioSchemesManagementPage'));

function CategoryProtectedRoute({ children }) {
  const { category_slug } = useParams();
  return (
    <ProtectedRoute module={category_slug?.toUpperCase()} action="view">
      {children}
    </ProtectedRoute>
  );
}

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
                  <CategoryProtectedRoute>
                    <SchemesPage />
                  </CategoryProtectedRoute>
                } 
              />
              <Route 
                path="schemes/:category_slug/:template_id" 
                element={
                  <CategoryProtectedRoute>
                    <SchemeTemplateDetailPage />
                  </CategoryProtectedRoute>
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
              <Route
                path="union-councils"
                element={<ProtectedRoute module="UNION_COUNCILS" action="view"><UnionCouncilsPage /></ProtectedRoute>}
              />
              <Route path="settings" element={<ProtectedRoute module="SETTINGS" action="view"><SettingsPage /></ProtectedRoute>} />
              
              {/* Public Website Management Routes */}
              <Route 
                path="website-settings" 
                element={<ProtectedRoute module="SETTINGS" action="view"><PublicWebsiteSettingsPage /></ProtectedRoute>}
              />
              <Route 
                path="news-management" 
                element={<ProtectedRoute module="NEWS" action="view"><NewsManagementPage /></ProtectedRoute>}
              />
              <Route
                path="feedback-management"
                element={<ProtectedRoute module="FEEDBACK" action="view"><FeedbackManagementPage /></ProtectedRoute>}
              />
              <Route
                path="team-management"
                element={<ProtectedRoute module="TEAM" action="view"><TeamManagementPage /></ProtectedRoute>}
              />
              <Route
                path="portfolio-schemes"
                element={<ProtectedRoute module="PORTFOLIO" action="view"><PortfolioSchemesManagementPage /></ProtectedRoute>}
              />
              <Route 
                path="complaints-management"
                element={<ProtectedRoute module="COMPLAINTS" action="view"><ComplaintsManagementPage /></ProtectedRoute>}
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
