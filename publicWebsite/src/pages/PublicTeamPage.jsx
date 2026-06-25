import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  InputAdornment,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AlternateEmail,
  Badge,
  Business,
  Groups,
  LocalPhone,
  LocationCity,
  Search,
  SupportAgent,
} from '@mui/icons-material';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { publicTeamAPI, resolveMediaUrl } from '../api/index.js';

export default function PublicTeamPage() {
  const { settings } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await publicTeamAPI.list({ ordering: 'sort_order' });
        if (!active) return;
        const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
        setMembers(data);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const departments = useMemo(() => {
    const names = members.map((member) => member.department).filter(Boolean);
    return ['All', ...Array.from(new Set(names))];
  }, [members]);

  const filteredMembers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      const matchesDepartment = departmentFilter === 'All' || member.department === departmentFilter;
      const matchesSearch =
        !term ||
        [member.name, member.designation, member.department, member.union_council, member.email, member.phone]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      return matchesDepartment && matchesSearch;
    });
  }, [departmentFilter, members, searchQuery]);

  const featuredMembers = filteredMembers.filter((member) => member.featured);
  const leadMember = featuredMembers[0] || null;
  const directoryMembers = leadMember
    ? filteredMembers.filter((member) => member.id !== leadMember.id)
    : filteredMembers;

  if (loading) {
    return <LinearProgress color="secondary" />;
  }

  return (
    <Box sx={{ pb: { xs: 6, md: 9 } }}>
      <Box
        sx={{
          borderBottom: '1px solid rgba(16,36,27,0.08)',
          background: 'linear-gradient(180deg, rgba(220,235,220,0.68) 0%, rgba(255,253,248,0.98) 100%)',
        }}
      >
        <Container sx={{ py: { xs: 5, md: 8 }, px: { xs: 3, md: 8 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(320px, 0.7fr)' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            <Box>
              <Chip
                icon={<Groups />}
                label={settings?.constituency || 'Public service team'}
                sx={{ bgcolor: alpha('#1f5f46', 0.10), color: 'primary.main', mb: 2.5 }}
              />
              <Typography
                variant="h1"
                sx={{
                  maxWidth: 900,
                  fontSize: { xs: '2.4rem', sm: '3.6rem', md: '4.8rem' },
                  lineHeight: { xs: 1.05, md: 1.02 },
                  overflowWrap: 'anywhere',
                }}
              >
                Meet the team serving the constituency
              </Typography>
              <Typography sx={{ mt: 2.5, maxWidth: 760, color: 'text.secondary', fontSize: '1.06rem' }}>
                A public directory of elected representatives, coordinators, and office staff who help citizens reach the right support channel.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3.5 }}>
                <Button component={RouterLink} to="/complaints" variant="contained" color="secondary" startIcon={<SupportAgent />}>
                  Reach the Office
                </Button>
                <Button component={RouterLink} to="/news" variant="outlined">
                  View Updates
                </Button>
              </Stack>
            </Box>

            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                border: '1px solid rgba(16,36,27,0.08)',
                bgcolor: 'rgba(255,255,255,0.72)',
              }}
            >
              <Typography variant="overline" color="secondary.main">
                Directory Summary
              </Typography>
              <Stack spacing={2.2} sx={{ mt: 2 }}>
                <SummaryRow icon={<Groups />} label="Members" value={members.length || '0'} />
                <SummaryRow icon={<Business />} label="Departments" value={Math.max(departments.length - 1, 0)} />
                {/* <SummaryRow icon={<Badge />} label="Featured Profiles" value={members.filter((member) => member.featured).length} /> */}
              </Stack>
            </Paper>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 4, md: 6 }, px: { xs: 3, md: 8 } }}>
        <Paper sx={{ p: { xs: 2.5, md: 3 }, border: '1px solid rgba(16,36,27,0.08)', mb: 3 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
              gap: 2,
              alignItems: 'center',
            }}
          >
            <TextField
              fullWidth
              placeholder="Search by name, designation, UC, department..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
            {departments.length > 1 && (
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' } }}>
                {departments.map((department) => (
                  <Chip
                    key={department}
                    label={department}
                    clickable
                    color={departmentFilter === department ? 'primary' : 'default'}
                    variant={departmentFilter === department ? 'filled' : 'outlined'}
                    onClick={() => setDepartmentFilter(department)}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Paper>

        <Box
          sx={{
            display: filteredMembers.length === 0 ? 'block' : 'grid',
            gridTemplateColumns: { xs: '1fr', lg: leadMember ? 'minmax(0, 0.92fr) minmax(0, 1.3fr)' : '1fr' },
            gap: { xs: 3, md: 4 },
            alignItems: 'start',
          }}
        >
          {leadMember && (
            <Box>
              <Card sx={{ overflow: 'hidden', border: '1px solid rgba(16,36,27,0.08)' }}>
                {resolveMediaUrl(leadMember.photo) ? (
                  <CardMedia
                    component="img"
                    image={resolveMediaUrl(leadMember.photo)}
                    alt={leadMember.name}
                    sx={{ height: { xs: 360, md: 520 }, objectFit: 'cover', objectPosition: 'top center' }}
                  />
                ) : (
                  <TeamImagePlaceholder height={{ xs: 360, md: 520 }} name={leadMember.name} />
                )}
                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                  <Typography variant="overline" color="secondary.main">
                    Team Member
                  </Typography>
                  <Typography variant="h3" sx={{ mt: 1, mb: 1 }}>
                    {leadMember.name}
                  </Typography>
                  <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                    {leadMember.designation}
                  </Typography>
                  {leadMember.bio && <Typography color="text.secondary">{leadMember.bio}</Typography>}
                  <MemberDetails member={leadMember} prominent />
                </CardContent>
              </Card>
            </Box>
          )}

          <Box>
            {filteredMembers.length === 0 ? (
              <Paper sx={{ p: 4, border: '1px solid rgba(16,36,27,0.08)', textAlign: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  No team members found
                </Typography>
                <Typography color="text.secondary">
                  Try another search term or check back after profiles are published.
                </Typography>
              </Paper>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: leadMember ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))' },
                  gap: 3,
                }}
              >
                {directoryMembers.map((member) => (
                  <TeamCard key={member.id} member={member} />
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, color: 'text.secondary' }}>
        <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>{icon}</Box>
        <Typography>{label}</Typography>
      </Box>
      <Typography variant="h5" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
    </Box>
  );
}

function TeamCard({ member }) {
  return (
    <Card sx={{ height: '100%', overflow: 'hidden', border: '1px solid rgba(16,36,27,0.08)' }}>
      {resolveMediaUrl(member.photo) ? (
        <CardMedia
          component="img"
          image={resolveMediaUrl(member.photo)}
          alt={member.name}
          sx={{ height: 380, objectFit: 'cover', objectPosition: 'top center' }}
        />
      ) : (
        <TeamImagePlaceholder height={380} name={member.name} compact />
      )}
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 0.7 }}>
          {member.name}
        </Typography>
        <Typography color="primary.main" sx={{ fontWeight: 800 }}>
          {member.designation}
        </Typography>
        {member.bio && (
          <Typography color="text.secondary" sx={{ mt: 1.5 }}>
            {member.bio}
          </Typography>
        )}
        <MemberDetails member={member} />
      </CardContent>
    </Card>
  );
}

function TeamImagePlaceholder({ height, name, compact = false }) {
  return (
    <Box
      sx={{
        height,
        p: compact ? 2.5 : { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'primary.main',
        background:
          'linear-gradient(135deg, rgba(220,235,220,0.88) 0%, rgba(255,253,248,0.96) 58%, rgba(180,138,67,0.18) 100%)',
      }}
    >
      <Groups sx={{ fontSize: compact ? 36 : 52 }} />
      <Box>
        <Typography variant="overline" color="secondary.main">
          Team Member
        </Typography>
        <Typography variant={compact ? 'h5' : 'h4'} sx={{ mt: 1 }}>
          {name}
        </Typography>
      </Box>
    </Box>
  );
}

function MemberDetails({ member, prominent = false }) {
  const details = [
    { value: member.department, icon: <Business fontSize="small" />, label: 'Department' },
    { value: member.union_council, icon: <LocationCity fontSize="small" />, label: 'Union Council' },
    { value: member.phone, icon: <LocalPhone fontSize="small" />, label: 'Phone', href: member.phone ? `tel:${member.phone}` : '' },
    { value: member.email, icon: <AlternateEmail fontSize="small" />, label: 'Email', href: member.email ? `mailto:${member.email}` : '' },
  ].filter((item) => item.value);

  if (!details.length) return null;

  return (
    <Stack spacing={1.1} sx={{ mt: prominent ? 2.6 : 2 }}>
      {details.map((item) => (
        <Box
          key={`${item.label}-${item.value}`}
          component={item.href ? 'a' : 'div'}
          href={item.href || undefined}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: 'text.secondary',
            textDecoration: 'none',
            overflowWrap: 'anywhere',
          }}
        >
          <Box sx={{ color: 'primary.main', display: 'inline-flex', flexShrink: 0 }}>{item.icon}</Box>
          <Typography variant="body2">
            <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>
              {item.label}:
            </Box>{' '}
            {item.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}
