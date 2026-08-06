import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../auth/AuthContext';
import { usersAPI } from '../api';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import {
  AccountTreeOutlined,
  AdminPanelSettingsOutlined,
  ArrowForward,
  CheckCircleOutlined,
  DescriptionOutlined,
  GroupOutlined,
  HourglassEmptyOutlined,
  NewspaperOutlined,
  PeopleOutlined,
  Refresh,
  VerifiedOutlined,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

const METRICS = [
  { key: 'total_users', label: 'Total users', icon: PeopleOutlined },
  { key: 'active_users', label: 'Active users', icon: VerifiedOutlined },
  { key: 'total_schemes', label: 'Total schemes', icon: DescriptionOutlined },
  { key: 'pending_schemes', label: 'Pending review', icon: HourglassEmptyOutlined, tone: 'warning' },
  { key: 'approved_schemes', label: 'Approved schemes', icon: CheckCircleOutlined, tone: 'success' },
  { key: 'total_roles', label: 'Access roles', icon: AdminPanelSettingsOutlined },
];

const QUICK_ACTIONS = [
  { label: 'Manage users', description: 'Accounts, roles, and access', path: '/users', icon: GroupOutlined, module: 'USERS' },
  { label: 'Open scheme registers', description: 'Review and maintain scheme data', path: '/categories', icon: AccountTreeOutlined, module: 'CATEGORIES' },
  { label: 'Publish an update', description: 'Create public news and notices', path: '/news-management', icon: NewspaperOutlined },
];

export default function DashboardPage() {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await usersAPI.getDashboardStats();
      setStats(response.data);
    } catch (requestError) {
      console.error(requestError);
      setError('Dashboard statistics could not be loaded. Your management tools are still available.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const visibleActions = QUICK_ACTIONS.filter((action) => !action.module || hasPermission(action.module, 'view'));

  const schemeMix = useMemo(() => {
    const total = Number(stats?.total_schemes || 0);
    const approved = Number(stats?.approved_schemes || 0);
    const pending = Number(stats?.pending_schemes || 0);
    return {
      total,
      approved,
      pending,
      approvedPercent: total ? Math.min(100, Math.round((approved / total) * 100)) : 0,
      pendingPercent: total ? Math.min(100, Math.round((pending / total) * 100)) : 0,
    };
  }, [stats]);

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'Administrator'}`}
        description="A clear view of portal access, scheme records, and publishing tools."
        actions={(
          <Button variant="outlined" startIcon={<Refresh />} onClick={loadStats} disabled={loading}>
            Refresh data
          </Button>
        )}
      />

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5 }}
          action={<Button color="inherit" size="small" onClick={loadStats}>Try again</Button>}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={2.25}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Grid container spacing={2.25}>
            {METRICS.map((metric, index) => {
              const Icon = metric.icon;
              const featured = index === 2;
              return (
                <Grid size={{ xs: 12, sm: 6, md: featured ? 8 : 4 }} key={metric.key}>
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: featured ? 170 : 142,
                      bgcolor: featured ? 'primary.dark' : 'background.paper',
                      color: featured ? 'primary.contrastText' : 'text.primary',
                      borderColor: featured ? 'primary.dark' : 'divider',
                      transition: 'transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': { transform: 'translateY(-2px)' },
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2.25, md: 2.5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: featured ? alpha('#FFFFFF', 0.78) : 'text.secondary', fontWeight: 650 }}
                        >
                          {metric.label}
                        </Typography>
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: 2.25,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: featured ? alpha('#FFFFFF', 0.12) : (theme) => alpha(theme.palette.primary.main, 0.08),
                            color: featured ? '#FFFFFF' : metric.tone ? `${metric.tone}.main` : 'primary.main',
                          }}
                        >
                          <Icon sx={{ fontSize: 21 }} />
                        </Box>
                      </Box>
                      <Box sx={{ mt: 'auto' }}>
                        {loading ? (
                          <Skeleton
                            width={featured ? 100 : 70}
                            height={52}
                            sx={{ bgcolor: featured ? alpha('#FFFFFF', 0.12) : undefined }}
                          />
                        ) : (
                          <Typography sx={{ fontSize: featured ? '2.5rem' : '2rem', lineHeight: 1, fontWeight: 780, letterSpacing: '-0.035em' }}>
                            {Number(stats?.[metric.key] ?? 0).toLocaleString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Stack spacing={2.25} sx={{ height: '100%' }}>
            <Card>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6">Scheme overview</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Current approval and review distribution.
                </Typography>

                {loading ? (
                  <Stack spacing={1.25} sx={{ mt: 3 }}>
                    <Skeleton height={18} />
                    <Skeleton width="70%" />
                    <Skeleton width="55%" />
                  </Stack>
                ) : schemeMix.total === 0 ? (
                  <Box sx={{ mt: 2.5, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      No scheme records are available yet.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ mt: 2.5 }}>
                    <Box
                      aria-label={`${schemeMix.approvedPercent}% approved and ${schemeMix.pendingPercent}% pending`}
                      sx={{ display: 'flex', height: 10, overflow: 'hidden', borderRadius: 5, bgcolor: '#E6ECE8' }}
                    >
                      <Box sx={{ width: `${schemeMix.approvedPercent}%`, bgcolor: 'success.main' }} />
                      <Box sx={{ width: `${schemeMix.pendingPercent}%`, bgcolor: 'warning.main' }} />
                    </Box>
                    <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Approved</Typography>
                        <Typography variant="h6">{schemeMix.approved.toLocaleString()}</Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">Pending</Typography>
                        <Typography variant="h6">{schemeMix.pending.toLocaleString()}</Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}
              </CardContent>
            </Card>

            <Card sx={{ flex: 1 }}>
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="h6">Quick actions</Typography>
                <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                  {visibleActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Box
                        component="button"
                        type="button"
                        key={action.path}
                        onClick={() => navigate(action.path)}
                        sx={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          border: 0,
                          borderRadius: 2,
                          bgcolor: 'transparent',
                          color: 'text.primary',
                          textAlign: 'left',
                          p: 1.25,
                          cursor: 'pointer',
                          font: 'inherit',
                          '&:hover': { bgcolor: 'action.hover' },
                          '&:active': { transform: 'translateY(1px)' },
                        }}
                      >
                        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'action.selected', color: 'primary.main', display: 'grid', placeItems: 'center' }}>
                          <Icon sx={{ fontSize: 20 }} />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700}>{action.label}</Typography>
                          <Typography variant="caption" color="text.secondary">{action.description}</Typography>
                        </Box>
                        <ArrowForward sx={{ fontSize: 18, color: 'text.secondary' }} />
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
