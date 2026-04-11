import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { usersAPI } from '../api';
import {
  Box, Grid, Card, CardContent, Typography, Skeleton,
} from '@mui/material';
import { People, Description, CheckCircle, HourglassEmpty, Verified, AdminPanelSettings } from '@mui/icons-material';

const STAT_CARDS = [
  { key: 'total_users', label: 'Total Users', icon: People, color: '#1B5E20', bg: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)' },
  { key: 'active_users', label: 'Active Users', icon: Verified, color: '#00695C', bg: 'linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%)' },
  { key: 'total_schemes', label: 'Total Schemes', icon: Description, color: '#0277BD', bg: 'linear-gradient(135deg, #E1F5FE 0%, #B3E5FC 100%)' },
  { key: 'pending_schemes', label: 'Pending', icon: HourglassEmpty, color: '#E65100', bg: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)' },
  { key: 'approved_schemes', label: 'Approved', icon: CheckCircle, color: '#2E7D32', bg: 'linear-gradient(135deg, #E8F5E9 0%, #A5D6A7 100%)' },
  { key: 'total_roles', label: 'Roles', icon: AdminPanelSettings, color: '#6A1B9A', bg: 'linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%)' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersAPI.getDashboardStats()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      {/* Welcome Banner */}
      <Card sx={{
        mb: 3, overflow: 'hidden',
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #00695C 100%)',
        color: '#fff', position: 'relative',
      }}>
        <Box sx={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -20, right: 60,
          width: 100, height: 100, borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)',
        }} />
        <CardContent sx={{ p: 3, position: 'relative' }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Welcome back, {user?.name} 👋
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.85 }}>
            Here&apos;s an overview of your MNA admin portal.
          </Typography>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <Grid container spacing={2.5}>
        {STAT_CARDS.map((card) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={card.key}>
            <Card sx={{
              borderRadius: 3, overflow: 'hidden',
              '&:hover': { transform: 'translateY(-2px)' },
              transition: 'transform 0.2s ease',
            }}>
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {card.label}
                    </Typography>
                    {loading ? (
                      <Skeleton width={60} height={40} />
                    ) : (
                      <Typography variant="h4" fontWeight={800} sx={{ color: card.color, mt: 0.5 }}>
                        {stats?.[card.key] ?? 0}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{
                    width: 52, height: 52, borderRadius: 3, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    background: card.bg,
                  }}>
                    <card.icon sx={{ fontSize: 26, color: card.color }} />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
