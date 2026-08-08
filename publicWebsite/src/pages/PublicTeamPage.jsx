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
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AlternateEmail,
  Business,
  Groups,
  LocalPhone,
  LocationCity,
  Search,
  SupportAgent,
} from '@mui/icons-material';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { publicTeamAPI, resolveMediaUrl } from '../api/index.js';

function cleanDisplayText(value = '') {
  return String(value).replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
}

function getInitials(name = '') {
  return cleanDisplayText(name)
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'TM';
}

export default function PublicTeamPage() {
  const { settings } = useOutletContext();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestKey, setRequestKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const response = await publicTeamAPI.list({ ordering: 'sort_order' });
        if (!active) return;
        const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
        setMembers(data);
      } catch (requestError) {
        console.error(requestError);
        if (active) setError('The team directory could not be loaded right now.');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [requestKey]);

  const departments = useMemo(() => {
    const names = members.map((member) => cleanDisplayText(member.department)).filter(Boolean);
    return ['All', ...Array.from(new Set(names))];
  }, [members]);

  const filteredMembers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    return members.filter((member) => {
      const department = cleanDisplayText(member.department);
      const matchesDepartment = departmentFilter === 'All' || department === departmentFilter;
      const matchesSearch =
        !term ||
        [member.name, member.designation, member.department, member.union_council, member.email, member.phone]
          .filter(Boolean)
          .some((value) => cleanDisplayText(value).toLowerCase().includes(term));
      return matchesDepartment && matchesSearch;
    });
  }, [departmentFilter, members, searchQuery]);

  const clearFilters = () => {
    setSearchQuery('');
    setDepartmentFilter('All');
  };

  return (
    <Box sx={{ pb: { xs: 6, md: 9 } }}>
      <Box
        sx={{
          borderBottom: '1px solid rgba(16,36,27,0.08)',
          background: 'linear-gradient(180deg, rgba(223,236,229,0.78) 0%, rgba(245,247,245,0.98) 100%)',
        }}
      >
        <Container sx={{ py: { xs: 5, md: 7 }, px: { xs: 3, md: 8 } }}>
          <Box
            className="scroll-reveal"
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.45fr) minmax(260px, 0.55fr)' },
              gap: { xs: 4, md: 7 },
              alignItems: 'end',
            }}
          >
            <Box>
              <Chip
                icon={<Groups />}
                label={cleanDisplayText(settings?.constituency) || 'Public service team'}
                sx={{ bgcolor: alpha('#1f5f46', 0.10), color: 'primary.main', mb: 2.5 }}
              />
              <Typography
                variant="h1"
                sx={{
                  maxWidth: 820,
                  fontSize: { xs: '2.35rem', sm: '3.25rem', md: '4rem' },
                  lineHeight: { xs: 1.06, md: 1.02 },
                }}
              >
                Your public service team
              </Typography>
              <Typography sx={{ mt: 2.25, maxWidth: 720, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.06rem' } }}>
                Find elected representatives, coordinators, and office staff serving the constituency, with direct contact details in one public directory.
              </Typography>
              <Button
                component={RouterLink}
                to="/complaints"
                variant="contained"
                color="secondary"
                startIcon={<SupportAgent />}
                sx={{ mt: 3.25 }}
              >
                Submit complaint
              </Button>
            </Box>

            <Box
              aria-label="Directory summary"
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                borderTop: '1px solid',
                borderBottom: '1px solid',
                borderColor: alpha('#1f5f46', 0.18),
                py: 2.25,
              }}
            >
              <SummaryStat label="Members" value={loading ? null : members.length} />
              <SummaryStat label="Departments" value={loading ? null : Math.max(departments.length - 1, 0)} divided />
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 4, md: 5.5 }, px: { xs: 3, md: 8 } }}>
        <Paper
          component="section"
          aria-labelledby="directory-tools-title"
          className="scroll-reveal"
          sx={{ p: { xs: 2.25, md: 2.75 }, border: '1px solid rgba(16,36,27,0.10)', mb: { xs: 3, md: 4 } }}
        >
          <Typography id="directory-tools-title" variant="overline" color="text.secondary">
            Find a team member
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(300px, 0.9fr) minmax(0, 1.1fr)' },
              gap: { xs: 2.25, lg: 3 },
              alignItems: 'end',
              mt: 1,
            }}
          >
            <Box>
              <Typography component="label" htmlFor="team-directory-search" variant="body2" sx={{ display: 'block', fontWeight: 700, mb: 0.75 }}>
                Search directory
              </Typography>
              <TextField
                id="team-directory-search"
                fullWidth
                size="small"
                placeholder="Name, role, union council, or department"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: 'text.secondary', fontSize: 21 }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            <Box>
              <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.75 }}>
                Filter by department
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {departments.map((department) => (
                  <Chip
                    key={department}
                    label={department}
                    clickable
                    size="small"
                    color={departmentFilter === department ? 'primary' : 'default'}
                    variant={departmentFilter === department ? 'filled' : 'outlined'}
                    onClick={() => setDepartmentFilter(department)}
                  />
                ))}
              </Stack>
            </Box>
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 2, mb: 2.25 }}>
          <Box>
            <Typography variant="overline" color="secondary.main">
              Team directory
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.4, fontSize: { xs: '1.65rem', md: '2rem' } }}>
              Members serving your area
            </Typography>
          </Box>
          {!loading && !error && (
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0 }}>
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
            </Typography>
          )}
        </Box>

        {loading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2.25 }}>
            {[0, 1, 2, 3].map((item) => <TeamTicketSkeleton key={item} />)}
          </Box>
        ) : error ? (
          <DirectoryMessage
            title="Directory temporarily unavailable"
            body={error}
            actionLabel="Try again"
            onAction={() => setRequestKey((key) => key + 1)}
          />
        ) : filteredMembers.length === 0 ? (
          <DirectoryMessage
            title="No matching team members"
            body="Try a different search term or clear the department filter."
            actionLabel="Clear filters"
            onAction={clearFilters}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
              gridAutoRows: '1fr',
              gap: { xs: 2, md: 2.25 },
            }}
          >
            {filteredMembers.map((member) => <TeamTicket key={member.id} member={member} />)}
          </Box>
        )}
      </Container>
    </Box>
  );
}

function SummaryStat({ label, value, divided = false }) {
  return (
    <Box sx={{ px: { xs: 1.5, sm: 2.5 }, borderLeft: divided ? '1px solid' : 0, borderColor: alpha('#1f5f46', 0.16) }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {value === null ? (
        <Skeleton width={44} height={40} />
      ) : (
        <Typography sx={{ mt: 0.15, fontSize: { xs: '1.75rem', md: '2rem' }, lineHeight: 1.1, fontWeight: 760 }}>
          {value}
        </Typography>
      )}
    </Box>
  );
}

function TeamTicket({ member }) {
  const photo = resolveMediaUrl(member.photo);
  const name = cleanDisplayText(member.name) || 'Team member';
  const designation = cleanDisplayText(member.designation);
  const bio = cleanDisplayText(member.bio);

  return (
    <Card
      component="article"
      className="scroll-reveal"
      sx={{
        minHeight: { xs: 218, sm: 230 },
        height: '100%',
        display: 'grid',
        gridTemplateColumns: { xs: '104px minmax(0, 1fr)', sm: '132px minmax(0, 1fr)' },
        overflow: 'hidden',
        transition: 'border-color 220ms var(--site-ease), transform 220ms var(--site-ease)',
        '&:hover': {
          borderColor: alpha('#176044', 0.28),
          transform: 'translateY(-2px)',
        },
      }}
    >
      {photo ? (
        <CardMedia
          component="img"
          image={photo}
          alt={`${name}, ${designation || 'team member'}`}
          sx={{ width: '100%', height: '100%', minHeight: { xs: 218, sm: 230 }, objectFit: 'cover', objectPosition: 'top center' }}
        />
      ) : (
        <TeamImagePlaceholder name={name} />
      )}

      <CardContent sx={{ minWidth: 0, p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } }, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="overline" color="secondary.main" sx={{ fontSize: '0.65rem', lineHeight: 1.4 }}>
          Team member
        </Typography>
        <Typography variant="h5" sx={{ mt: 0.45, fontSize: { xs: '1.06rem', sm: '1.2rem' }, overflowWrap: 'anywhere' }}>
          {name}
        </Typography>
        {designation && (
          <Typography color="primary.main" sx={{ mt: 0.35, fontWeight: 720, fontSize: '0.86rem' }}>
            {designation}
          </Typography>
        )}
        {bio && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2, overflow: 'hidden', fontSize: '0.82rem' }}
          >
            {bio}
          </Typography>
        )}
        <MemberDetails member={member} />
      </CardContent>
    </Card>
  );
}

function TeamImagePlaceholder({ name }) {
  return (
    <Box
      role="img"
      aria-label={`No portrait available for ${name}`}
      sx={{
        minHeight: { xs: 218, sm: 230 },
        display: 'grid',
        placeItems: 'center',
        color: 'primary.dark',
        background: 'linear-gradient(145deg, rgba(212,230,220,0.96) 0%, rgba(238,243,240,0.98) 100%)',
      }}
    >
      <Box
        sx={{
          width: { xs: 62, sm: 72 },
          aspectRatio: '1',
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha('#176044', 0.10),
          border: '1px solid',
          borderColor: alpha('#176044', 0.16),
        }}
      >
        <Typography sx={{ fontWeight: 760, fontSize: { xs: '1.35rem', sm: '1.55rem' }, letterSpacing: '-0.03em' }}>
          {getInitials(name)}
        </Typography>
      </Box>
    </Box>
  );
}

function MemberDetails({ member }) {
  const department = cleanDisplayText(member.department);
  const unionCouncil = cleanDisplayText(member.union_council);
  const phone = cleanDisplayText(member.phone);
  const email = cleanDisplayText(member.email);

  const details = [
    { value: department, icon: <Business />, label: 'Department' },
    { value: unionCouncil, icon: <LocationCity />, label: 'Union council' },
    { value: phone, icon: <LocalPhone />, label: 'Phone', href: phone ? `tel:${phone}` : '' },
    { value: email, icon: <AlternateEmail />, label: 'Email', href: email ? `mailto:${email}` : '' },
  ].filter((item) => item.value);

  if (!details.length) return null;

  return (
    <Stack spacing={0.55} sx={{ mt: 'auto', pt: 1.4, minWidth: 0 }}>
      {details.map((item) => (
        <Box
          key={`${item.label}-${item.value}`}
          component={item.href ? 'a' : 'div'}
          href={item.href || undefined}
          aria-label={item.href ? `${item.label}: ${item.value}` : undefined}
          sx={{
            minWidth: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 0.75,
            color: item.href ? 'primary.main' : 'text.secondary',
            textDecoration: 'none',
            '&:hover': item.href ? { textDecoration: 'underline' } : undefined,
            '&:focus-visible': item.href ? { outline: '2px solid', outlineColor: 'secondary.main', outlineOffset: 2, borderRadius: 1 } : undefined,
          }}
        >
          <Box sx={{ display: 'inline-flex', flexShrink: 0, '& svg': { fontSize: 16 } }}>{item.icon}</Box>
          <Typography variant="caption" sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: item.href ? 700 : 520 }}>
            {item.value}
          </Typography>
        </Box>
      ))}
    </Stack>
  );
}

function TeamTicketSkeleton() {
  return (
    <Card sx={{ minHeight: 230, display: 'grid', gridTemplateColumns: { xs: '104px minmax(0, 1fr)', sm: '132px minmax(0, 1fr)' }, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" width="100%" height="100%" />
      <Box sx={{ p: 2.5 }}>
        <Skeleton width="30%" />
        <Skeleton width="72%" height={34} />
        <Skeleton width="48%" />
        <Skeleton width="90%" sx={{ mt: 1.5 }} />
        <Skeleton width="64%" />
      </Box>
    </Card>
  );
}

function DirectoryMessage({ title, body, actionLabel, onAction }) {
  return (
    <Paper sx={{ p: { xs: 3, md: 4 }, border: '1px solid rgba(16,36,27,0.10)', textAlign: 'center' }}>
      <Groups sx={{ color: 'primary.main', fontSize: 34, mb: 1 }} />
      <Typography variant="h5">{title}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75 }}>
        {body}
      </Typography>
      <Button variant="outlined" onClick={onAction} sx={{ mt: 2 }}>
        {actionLabel}
      </Button>
    </Paper>
  );
}
