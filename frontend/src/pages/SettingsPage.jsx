import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { usersAPI } from '../api';
import {
  Box, Card, CardContent, Typography, TextField, Button,
  Grid, Divider, Alert, CircularProgress
} from '@mui/material';
import { Save, LockReset } from '@mui/icons-material';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  
  // Profile state
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password state
  const [passwordData, setPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);
    try {
      const res = await usersAPI.updateProfile(profileData);
      updateUser({ name: res.data.name, email: res.data.email });
      setProfileMsg({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);
    try {
      await usersAPI.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setPasswordMsg({ type: 'success', text: 'Password changed successfully' });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      setPasswordMsg({ 
        type: 'error', 
        text: err.response?.data?.old_password?.[0] || err.response?.data?.new_password?.[0] || 'Failed to change password' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Account Settings</Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Profile Information</Typography>
              <Divider sx={{ mb: 3 }} />
              
              {profileMsg.text && (
                <Alert severity={profileMsg.type} sx={{ mb: 3 }}>{profileMsg.text}</Alert>
              )}

              <form onSubmit={handleProfileSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Full Name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    required
                  />
                  <TextField
                    label="Email Address"
                    type="email"
                    value={profileData.email}
                    disabled
                    helperText="Contact admin to change email address"
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={profileLoading ? <CircularProgress size={20} color="inherit" /> : <Save />}
                    disabled={profileLoading}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Change Password</Typography>
              <Divider sx={{ mb: 3 }} />

              {passwordMsg.text && (
                <Alert severity={passwordMsg.type} sx={{ mb: 3 }}>{passwordMsg.text}</Alert>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <TextField
                    label="Current Password"
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                    required
                  />
                  <TextField
                    label="New Password"
                    type="password"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                    required
                    helperText="Minimum 8 characters"
                  />
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    value={passwordData.confirm_password}
                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    startIcon={passwordLoading ? <CircularProgress size={20} color="inherit" /> : <LockReset />}
                    disabled={passwordLoading}
                    sx={{ alignSelf: 'flex-start', mt: 1 }}
                  >
                    Update Password
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
