import { createElement, useCallback, useEffect, useMemo, useState } from 'react';
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
  AccountBalanceWalletOutlined,
  ArrowForward,
  ArrowOutward,
  CampaignOutlined,
  DonutLargeOutlined,
  DescriptionOutlined,
  GroupOutlined,
  HourglassEmptyOutlined,
  InsertChartOutlined,
  NewspaperOutlined,
  PeopleOutlined,
  Refresh,
  ReportProblemOutlined,
  TaskAltOutlined,
} from '@mui/icons-material';
import PageHeader from '../components/PageHeader';

const QUICK_ACTIONS = [
  { label: 'Manage users', description: 'Accounts, roles, and access', path: '/users', icon: GroupOutlined, module: 'USERS' },
  { label: 'Open scheme registers', description: 'Review and maintain scheme data', path: '/categories', icon: AccountTreeOutlined, module: 'CATEGORIES' },
  { label: 'Publish an update', description: 'Create public news and notices', path: '/news-management', icon: NewspaperOutlined },
];

const formatNumber = (value) => Number(value || 0).toLocaleString();

function StatCard({ label, value, detail, icon, prefix = '', tone = 'primary', featured = false, loading }) {
  return (
    <Card sx={{ height: '100%', minHeight: featured ? 176 : 150, bgcolor: featured ? 'primary.dark' : 'background.paper', color: featured ? 'primary.contrastText' : 'text.primary', borderColor: featured ? 'primary.dark' : 'divider', overflow: 'hidden', position: 'relative' }}>
      {featured && <Box sx={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', border: '1px solid', borderColor: alpha('#fff', 0.12), right: -48, bottom: -74 }} />}
      <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="body2" sx={{ color: featured ? alpha('#fff', 0.72) : 'text.secondary', fontWeight: 700 }}>{label}</Typography>
          <Box sx={{ width: 38, height: 38, borderRadius: 2.25, display: 'grid', placeItems: 'center', bgcolor: featured ? alpha('#fff', 0.12) : (theme) => alpha(theme.palette[tone].main, 0.1), color: featured ? '#fff' : `${tone}.main` }}>{createElement(icon, { sx: { fontSize: 20 } })}</Box>
        </Box>
        <Box sx={{ mt: 'auto' }}>
          {loading ? <Skeleton width={85} height={52} sx={{ bgcolor: featured ? alpha('#fff', 0.12) : undefined }} /> : <Typography sx={{ fontSize: featured ? '2.55rem' : '2.1rem', lineHeight: 1, fontWeight: 780, letterSpacing: '-0.05em' }}>{prefix}{formatNumber(value)}</Typography>}
          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: featured ? alpha('#fff', 0.68) : 'text.secondary' }}>{detail}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

function EmptyChart({ message }) {
  return <Box sx={{ height: 190, display: 'grid', placeItems: 'center', textAlign: 'center', borderRadius: 2.5, bgcolor: 'background.default', px: 3 }}><Box><InsertChartOutlined sx={{ color: 'text.disabled', mb: 0.75 }} /><Typography variant="body2" color="text.secondary">{message}</Typography></Box></Box>;
}

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
  const complaintMix = stats?.complaints || {};
  const publishing = stats?.publishing || {};
  const categoryMax = Math.max(...(stats?.categories || []).map((category) => category.scheme_count), 1);

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
        <Grid size={{ xs: 12, md: 6, xl: 3 }}><StatCard label="Total schemes" value={stats?.total_schemes} detail={`${formatNumber(stats?.completed_schemes)} completed & inaugurated`} icon={DescriptionOutlined} featured loading={loading} /></Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}><StatCard label="Pending review" value={stats?.pending_schemes} detail="Awaiting an approval decision" icon={HourglassEmptyOutlined} tone="warning" loading={loading} /></Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}><StatCard label="Open complaints" value={complaintMix.open} detail={`${formatNumber(complaintMix.in_progress)} currently in progress`} icon={ReportProblemOutlined} tone="warning" loading={loading} /></Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}><StatCard label="Budget tracked" value={stats?.total_budget} prefix="PKR " detail="Across every scheme record" icon={AccountBalanceWalletOutlined} loading={loading} /></Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}><Box><Typography variant="h6">Scheme pipeline</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Live distribution across approval stages.</Typography></Box><DonutLargeOutlined color="primary" /></Stack>
              {loading ? <Skeleton sx={{ mt: 3 }} height={205} /> : schemeMix.total === 0 ? <Box sx={{ mt: 2.5 }}><EmptyChart message="Add a scheme record to begin tracking the delivery pipeline." /></Box> : <Box sx={{ mt: 3 }}>
                {[['Approved', schemeMix.approved, 'success.main'], ['Pending review', schemeMix.pending, 'warning.main'], ['Completed', Number(stats?.completed_schemes || 0), 'primary.main']].map(([label, value, color]) => <Box key={label} sx={{ mb: 2.2 }}><Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}><Typography variant="body2" fontWeight={700}>{label}</Typography><Typography variant="body2" color="text.secondary">{formatNumber(value)} <Box component="span" sx={{ color: 'text.disabled' }}>· {Math.round((value / schemeMix.total) * 100)}%</Box></Typography></Stack><Box sx={{ height: 11, borderRadius: 10, bgcolor: 'background.default', overflow: 'hidden' }}><Box sx={{ width: `${(value / schemeMix.total) * 100}%`, minWidth: value ? 10 : 0, height: '100%', borderRadius: 10, bgcolor: color, transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)' }} /></Box></Box>)}
              </Box>}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Typography variant="h6">Scheme coverage</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Records by category.</Typography>
              {loading ? <Skeleton sx={{ mt: 3 }} height={205} /> : !(stats?.categories || []).some((category) => category.scheme_count) ? <Box sx={{ mt: 2.5 }}><EmptyChart message="Category coverage will appear as schemes are added." /></Box> : <Stack spacing={1.75} sx={{ mt: 3 }}>{stats.categories.map((category) => <Box key={category.name}><Stack direction="row" justifyContent="space-between" sx={{ mb: 0.55 }}><Typography variant="caption" fontWeight={700}>{category.name}</Typography><Typography variant="caption" color="text.secondary">{formatNumber(category.scheme_count)}</Typography></Stack><Box sx={{ height: 7, borderRadius: 10, bgcolor: 'background.default' }}><Box sx={{ width: `${(category.scheme_count / categoryMax) * 100}%`, height: '100%', borderRadius: 10, bgcolor: 'secondary.main' }} /></Box></Box>)}</Stack>}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 7 }}>
          <Card>
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={2}><Box><Typography variant="h6">Public presence</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>What citizens can currently see on the portal.</Typography></Box><Button size="small" endIcon={<ArrowOutward />} onClick={() => navigate('/news-management')}>Manage content</Button></Stack>
              <Grid container spacing={1.5} sx={{ mt: 1.5 }}>{[[publishing.news_published, 'Published updates', NewspaperOutlined, 'primary.main'], [publishing.feedback_published, 'Published feedback', CampaignOutlined, 'secondary.main'], [publishing.team_published, 'Team profiles live', GroupOutlined, 'success.main'], [publishing.portfolio_ongoing, 'Ongoing portfolio', TaskAltOutlined, 'warning.main']].map(([value, label, icon, color]) => <Grid size={{ xs: 6, sm: 3 }} key={label}><Box sx={{ p: 1.6, height: '100%', borderRadius: 2.25, bgcolor: 'background.default' }}>{createElement(icon, { sx: { color, fontSize: 20 } })}<Typography sx={{ fontSize: '1.5rem', fontWeight: 760, mt: 1 }}>{loading ? '–' : formatNumber(value)}</Typography><Typography variant="caption" color="text.secondary">{label}</Typography></Box></Grid>)}</Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
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
        </Grid>
      </Grid>
    </Box>
  );
}
