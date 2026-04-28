import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { AuthProvider } from './auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import theme from './theme/theme';

import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import SchemesPage from './pages/SchemesPage';
import RolesPage from './pages/RolesPage';
import CategoriesPage from './pages/CategoriesPage';
import SettingsPage from './pages/SettingsPage';
import SchemeTemplateDetailPage from './pages/SchemeTemplateDetailPage';
import PublicWebsiteSettingsPage from './pages/PublicWebsiteSettingsPage';
import NewsManagementPage from './pages/NewsManagementPage';
import ComplaintsManagementPage from './pages/ComplaintsManagementPage';
import FeedbackManagementPage from './pages/FeedbackManagementPage';

function App() {
  const basename = window.location.pathname.startsWith('/admin') ? '/admin' : '';

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter basename={basename}>
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
                path="complaints-management"
                element={<ComplaintsManagementPage />}
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
