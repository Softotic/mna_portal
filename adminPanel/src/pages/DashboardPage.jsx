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

function ChartBar({ label, value, percent, color, compact = false }) {
  const countLabel = `${formatNumber(value)} ${Number(value) === 1 ? 'entry' : 'entries'}`;
  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', columnGap: { xs: 0.8, sm: 1.25 }, mb: compact ? 0.75 : 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <Box sx={{ width: 8, height: 8, flex: '0 0 auto', mr: 0.9, borderRadius: '50%', bgcolor: color }} />
          <Typography variant={compact ? 'body2' : 'subtitle2'} fontWeight={compact ? 650 : 700} noWrap>{label}</Typography>
        </Box>
        <Box component="span" sx={{ px: 0.8, py: 0.25, borderRadius: 1, bgcolor: 'background.default', color: 'text.secondary', fontSize: compact ? '0.6875rem' : '0.75rem', fontWeight: 700, whiteSpace: 'nowrap' }}>{countLabel}</Box>
        <Typography variant="caption" sx={{ minWidth: compact ? 34 : 38, textAlign: 'right', color: 'text.secondary', fontWeight: 700, whiteSpace: 'nowrap' }}>{percent}%</Typography>
      </Box>
      <Box sx={{ height: compact ? 8 : 10, borderRadius: 10, bgcolor: 'background.default', overflow: 'hidden' }}>
        <Box sx={{ width: `${percent}%`, minWidth: value ? 10 : 0, height: '100%', borderRadius: 10, bgcolor: color, transition: 'width 700ms cubic-bezier(0.16, 1, 0.3, 1)' }} />
      </Box>
    </Box>
  );
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
    const announced = Number(stats?.announced_schemes || 0);
    const inProgress = Number(stats?.in_progress_schemes || 0);
    const awaitingInauguration = Number(stats?.awaiting_inauguration_schemes || 0);
    const inaugurated = Number(stats?.inaugurated_schemes || 0);
    return {
      total,
      announced,
      inProgress,
      awaitingInauguration,
      inaugurated,
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
        <Grid size={{ xs: 12, md: 6, xl: 3 }}><StatCard label="Total scheme entries" value={stats?.total_schemes} detail={`${formatNumber(schemeMix.inaugurated)} completed & inaugurated`} icon={DescriptionOutlined} featured loading={loading} /></Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}><StatCard label="In progress" value={schemeMix.inProgress} detail="Actively being delivered" icon={HourglassEmptyOutlined} tone="warning" loading={loading} /></Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}><StatCard label="Open complaints" value={complaintMix.open} detail={`${formatNumber(complaintMix.in_progress)} currently in progress`} icon={ReportProblemOutlined} tone="warning" loading={loading} /></Grid>
        <Grid size={{ xs: 12, md: 6, xl: 3 }}><StatCard label="Active users" value={stats?.active_users} detail={`${formatNumber(stats?.total_users)} total portal accounts`} icon={PeopleOutlined} loading={loading} /></Grid>

        <Grid size={{ xs: 12, lg: 7 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}><Box><Typography variant="h6">Scheme pipeline</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Live distribution across delivery stages.</Typography></Box><Box sx={{ width: 42, height: 42, borderRadius: 2.5, bgcolor: 'action.selected', color: 'primary.main', display: 'grid', placeItems: 'center' }}><DonutLargeOutlined /></Box></Stack>
              {loading ? <Skeleton sx={{ mt: 3 }} height={205} /> : schemeMix.total === 0 ? <Box sx={{ mt: 2.5 }}><EmptyChart message="Add a scheme record to begin tracking the delivery pipeline." /></Box> : <Box sx={{ mt: 3 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                  {[['Announced but not started', schemeMix.announced, 'secondary.main'], ['In progress', schemeMix.inProgress, 'warning.main'], ['Completed – to be inaugurated', schemeMix.awaitingInauguration, 'primary.main'], ['Completed & inaugurated', schemeMix.inaugurated, 'success.main']].map(([label, value, color]) => <ChartBar key={label} label={label} value={value} percent={Math.round((value / schemeMix.total) * 100)} color={color} />)}
                </Box>
              </Box>}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 5 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}><Box><Typography variant="h6">Scheme coverage</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Records by category.</Typography></Box><Typography variant="caption" sx={{ px: 1, py: 0.5, borderRadius: 1.5, bgcolor: 'action.selected', color: 'primary.main', fontWeight: 700 }}>Top categories</Typography></Stack>
              {loading ? <Skeleton sx={{ mt: 3 }} height={205} /> : !(stats?.categories || []).some((category) => category.scheme_count) ? <Box sx={{ mt: 2.5 }}><EmptyChart message="Category coverage will appear as schemes are added." /></Box> : <Stack spacing={2.1} sx={{ mt: 3 }}>{stats.categories.map((category) => <ChartBar key={category.name} label={category.name} value={category.scheme_count} percent={Math.round((category.scheme_count / categoryMax) * 100)} color="secondary.main" compact />)}</Stack>}
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
