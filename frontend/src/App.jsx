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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
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
              <Route path="schemes/:slug" element={<SchemesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
