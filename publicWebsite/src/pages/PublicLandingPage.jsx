import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  Container,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowForward,
  ArrowOutward,
  AssignmentTurnedIn,
  Campaign,
  FlagOutlined,
  Newspaper,
  QueryStats,
  Room,
  SupportAgent,
  VerifiedOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { publicFeedbacksAPI, publicNewsAPI, resolveMediaUrl } from '../api/index.js';

const heroFallback = '/images/civic-office-hero.jpg';

function toList(value, fallback) {
  const list = value
    ?.split(/\n+/)
    .map((item) => cleanDisplayText(item).trim())
    .filter(Boolean);
  return list?.length ? list : fallback;
}

function trimWords(value, limit) {
  const words = cleanDisplayText(value).trim().split(/\s+/).filter(Boolean);
  if (words.length <= limit) return words.join(' ');
  return `${words.slice(0, limit).join(' ')}...`;
}

function trimAtSentence(value, limit) {
  const text = cleanDisplayText(value).replace(/\s+/g, ' ').trim();
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= limit) return text;

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  let summary = '';

  for (const sentence of sentences) {
    const candidate = `${summary} ${sentence.trim()}`.trim();
    if (candidate.split(/\s+/).length > limit) break;
    summary = candidate;
  }

  return summary || trimWords(text, limit);
}

function cleanDisplayText(value) {
  return String(value || '').replace(/[\u2013\u2014]/g, '-');
}

function cleanLeaderName(value) {
  return cleanDisplayText(value).replace(/^about\s+/i, '').trim();
}

function organizePrinciples(items) {
  const normalized = items.map((item) => cleanDisplayText(item).trim()).filter(Boolean);
  const principles = [];

  for (let index = 0; index < normalized.length && principles.length < 3; index += 1) {
    const current = normalized[index];
    const next = normalized[index + 1];
    const currentWordCount = current.split(/\s+/).length;
    const nextWordCount = next?.split(/\s+/).length || 0;

    if (currentWordCount <= 4 && nextWordCount >= 5) {
      principles.push({ title: trimWords(current, 4), description: trimWords(next, 18) });
      index += 1;
    } else {
      principles.push({ title: trimWords(current, 7), description: '' });
    }
  }

  return principles;
}

function summarizeNews(item) {
  const source = item?.excerpt || item?.content || '';
  const text = source.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return trimWords(text || 'Open the full update for more information.', 24);
}

function getNewsImage(item) {
  return resolveMediaUrl(item?.image || item?.images?.[0]?.image || '');
}

const serviceLinks = [
  {
    title: 'Submit and track a complaint',
    description: 'Send your concern with supporting files and follow progress using your reference number.',
    path: '/complaints',
    action: 'Open complaints',
    icon: SupportAgent,
  },
  {
    title: 'Review public schemes',
    description: 'Explore development work by union council, category, and current status.',
    path: '/schemes',
    action: 'View schemes',
    icon: AssignmentTurnedIn,
  },
  {
    title: 'Read official updates',
    description: 'Follow constituency news, office statements, and public announcements.',
    path: '/news',
    action: 'Visit newsroom',
    icon: Newspaper,
  },
];

const complaintJourney = [
  {
    title: 'Share the issue clearly',
    body: 'Add the category, location, contact details, and any supporting document that helps the office understand your case.',
    icon: Campaign,
  },
  {
    title: 'Keep your reference number',
    body: 'A tracking number is created after submission so you can return to the portal without repeating your information.',
    icon: AssignmentTurnedIn,
  },
  {
    title: 'Follow every office response',
    body: 'Review the latest status, remarks, attachments, and case history from the same public page.',
    icon: QueryStats,
  },
];

export default function PublicLandingPage() {
  const { settings } = useOutletContext();
  const [featuredNews, setFeaturedNews] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [activeMandate, setActiveMandate] = useState('mission');
  const [briefView, setBriefView] = useState('priorities');
  const [activePrinciple, setActivePrinciple] = useState(0);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const [newsResponse, feedbackResponse] = await Promise.all([
          publicNewsAPI.featured(),
          publicFeedbacksAPI.featured(),
        ]);
        if (!active) return;
        setFeaturedNews(Array.isArray(newsResponse.data) ? newsResponse.data : newsResponse.data?.results || []);
        setFeedbacks(Array.isArray(feedbackResponse.data) ? feedbackResponse.data : feedbackResponse.data?.results || []);
      } catch (error) {
        console.error(error);
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const achievements = useMemo(
    () =>
      toList(settings?.achievements, [
        'Accessible constituency support',
        'Transparent complaint tracking',
        'Clear public communication',
      ]),
    [settings],
  );

  const values = useMemo(
    () =>
      toList(settings?.values, [
        'Service to the people',
        'Transparency and accountability',
        'Local representation with dignity',
      ]),
    [settings],
  );

  const missionPoints = useMemo(
    () =>
      toList(settings?.mission, [
        'Make constituency support easier to access through clear public service channels.',
        'Improve access to development work, office communication, and local representation.',
      ]),
    [settings],
  );

  const visionPoints = useMemo(
    () =>
      toList(settings?.vision, [
        'Build a public office grounded in access, accountability, and citizen trust.',
        'Support long-term local development through responsible representation.',
      ]),
    [settings],
  );

  const principles = useMemo(() => organizePrinciples(values), [values]);

  const leaderName = cleanLeaderName(settings?.leader_name || settings?.site_name || 'Member of the National Assembly');
  const designation = cleanDisplayText(settings?.designation || 'Member of the National Assembly');
  const heroMessage = trimWords(
    `${designation}. ${settings?.hero_statement || settings?.site_message || 'Direct access to constituency services, public updates, and office communication.'}`,
    20,
  );
  const heroImage = settings?.intro_image ? resolveMediaUrl(settings.intro_image) : heroFallback;

  return (
    <Box>
      <Box
        component="section"
        aria-labelledby="hero-heading"
        sx={{
          minHeight: { lg: 'calc(100dvh - 108px)' },
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: 420,
            height: 420,
            left: '-16%',
            top: '-30%',
            borderRadius: '50%',
            background: 'rgba(23,96,68,0.075)',
            filter: 'blur(2px)',
            pointerEvents: 'none',
          },
        }}
      >
        <Container sx={{ py: { xs: 5, sm: 6, lg: 7.5 }, position: 'relative' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(360px, 0.72fr)' },
              gap: { xs: 4, md: 6, lg: 8 },
              alignItems: 'center',
            }}
          >
            <Box sx={{ maxWidth: 780 }}>
              <Chip
                label={settings?.constituency || 'Official constituency portal'}
                variant="outlined"
                sx={{ mb: 2.5, color: 'primary.dark', bgcolor: 'background.paper', borderColor: alpha('#176044', 0.28) }}
              />
              <Typography
                id="hero-heading"
                variant="h1"
                sx={{
                  fontSize: { xs: 'clamp(2.55rem, 12vw, 3.65rem)', sm: '4.5rem', lg: 'clamp(4rem, 6vw, 5.75rem)' },
                  maxWidth: 760,
                  overflowWrap: 'anywhere',
                }}
              >
                {leaderName}
              </Typography>
              <Typography sx={{ mt: 2.2, maxWidth: 650, color: 'text.secondary', fontSize: { xs: '1.03rem', md: '1.18rem' }, lineHeight: 1.68 }}>
                {heroMessage}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5, alignItems: { xs: 'stretch', sm: 'center' } }}>
                <Button component={RouterLink} to="/complaints" variant="contained" endIcon={<ArrowOutward />}>
                  Submit complaint
                </Button>
                <Button component={RouterLink} to="/schemes" variant="outlined" endIcon={<ArrowForward />}>
                  View schemes
                </Button>
              </Stack>
            </Box>

            <Box sx={{ position: 'relative', justifySelf: { lg: 'end' }, width: '100%', maxWidth: { xs: 620, lg: 470 } }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: { xs: '18px -10px -10px 18px', md: '24px -18px -18px 24px' },
                  borderRadius: 2,
                  bgcolor: 'primary.main',
                  opacity: 0.13,
                }}
              />
              <CardMedia
                component="img"
                image={heroImage}
                alt={settings?.intro_image ? `Portrait of ${leaderName}` : 'Citizens approaching a modern public office building'}
                loading="eager"
                fetchPriority="high"
                sx={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: { xs: '4 / 4.2', sm: '5 / 4', lg: '4 / 4.8' },
                  borderRadius: 2,
                  objectFit: 'cover',
                  objectPosition: settings?.intro_image ? 'center 20%' : 'center',
                  border: '1px solid',
                  borderColor: alpha('#176044', 0.18),
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      <Box component="section" aria-labelledby="services-heading" sx={{ py: { xs: 7, md: 11 } }}>
        <Container>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(250px, 0.72fr) minmax(0, 1.28fr)' }, gap: { xs: 4, md: 8 } }}>
            <Box sx={{ alignSelf: 'start', position: { md: 'sticky' }, top: { md: 116 } }}>
              <Typography id="services-heading" variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.4rem' }, maxWidth: 420 }}>
                Public service, in one place
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 440 }}>
                Find the right route quickly, whether you need support, project information, or an official update.
              </Typography>
            </Box>

            <Box sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
              {serviceLinks.map((item, index) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={item.title}
                    component={RouterLink}
                    to={item.path}
                    className="scroll-reveal"
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '48px minmax(0, 1fr)', sm: '58px minmax(0, 1fr) auto' },
                      gap: { xs: 1.5, sm: 2.4 },
                      alignItems: 'center',
                      py: { xs: 3, md: 4 },
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      transition: 'background-color 240ms var(--site-ease), transform 240ms var(--site-ease)',
                      '&:hover': { bgcolor: alpha('#176044', 0.045), transform: { sm: 'translateX(6px)' } },
                      '&:focus-visible': { outline: '3px solid', outlineColor: alpha('#d69a35', 0.48), outlineOffset: 3 },
                    }}
                  >
                    <Box sx={{ width: { xs: 44, sm: 52 }, height: { xs: 44, sm: 52 }, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: index === 0 ? 'primary.main' : 'primary.light', color: 'primary.contrastText' }}>
                      <Icon />
                    </Box>
                    <Box>
                      <Typography variant="h5">{item.title}</Typography>
                      <Typography color="text.secondary" sx={{ mt: 0.65, maxWidth: 580 }}>{item.description}</Typography>
                    </Box>
                    <Button component="span" endIcon={<ArrowForward />} sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                      {item.action}
                    </Button>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Container>
      </Box>

      <Box component="section" aria-labelledby="journey-heading" sx={{ py: { xs: 7, md: 12 }, bgcolor: 'primary.dark', color: '#f3f8f5' }}>
        <Container>
          <Box sx={{ maxWidth: 720, mb: { xs: 5, md: 7 } }}>
            <Typography id="journey-heading" variant="h2" sx={{ color: 'inherit', fontSize: { xs: '2.2rem', md: '3.65rem' } }}>
              A clear path from concern to response
            </Typography>
            <Typography sx={{ mt: 2, color: 'rgba(243,248,245,0.72)', maxWidth: 650 }}>
              The complaint portal keeps each case understandable from the first submission to the latest office action.
            </Typography>
          </Box>

          <Box sx={{ position: 'relative', pl: { xs: 0, md: 7 } }}>
            <Box
              aria-hidden="true"
              sx={{
                display: { xs: 'none', md: 'block' },
                position: 'absolute',
                left: 16,
                top: 18,
                bottom: 18,
                width: 2,
                bgcolor: 'rgba(255,255,255,0.16)',
                '&::after': {
                  content: '""',
                  display: 'block',
                  width: '100%',
                  height: '100%',
                  transformOrigin: 'top',
                  bgcolor: 'secondary.main',
                  animation: 'service-progress 1ms linear both',
                  animationTimeline: 'view()',
                  animationRange: 'entry 10% cover 72%',
                },
              }}
            />
            {complaintJourney.map((item) => {
              const Icon = item.icon;
              return (
                <Box
                  key={item.title}
                  className="scroll-reveal"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '48px minmax(0, 1fr)', md: '72px minmax(0, 1fr)' },
                    gap: { xs: 2, md: 3 },
                    alignItems: 'start',
                    py: { xs: 3, md: 4.5 },
                    borderBottom: '1px solid rgba(255,255,255,0.13)',
                  }}
                >
                  <Box sx={{ width: { xs: 46, md: 60 }, height: { xs: 46, md: 60 }, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: 'rgba(255,255,255,0.1)', color: 'secondary.light' }}>
                    <Icon />
                  </Box>
                  <Box>
                    <Typography variant="h3" sx={{ color: 'inherit', fontSize: { xs: '1.55rem', md: '2.35rem' } }}>{item.title}</Typography>
                    <Typography sx={{ mt: 1.2, color: 'rgba(243,248,245,0.7)', maxWidth: 700 }}>{item.body}</Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
          <Button component={RouterLink} to="/complaints" variant="contained" color="secondary" endIcon={<ArrowOutward />} sx={{ mt: 4 }}>
            Track complaint
          </Button>
        </Container>
      </Box>

      {false && (
      <Box
        component="section"
        aria-labelledby="office-heading"
        sx={{
          py: { xs: 7, md: 12 },
          bgcolor: alpha('#176044', 0.025),
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.04fr) minmax(360px, 0.78fr)' },
              gap: { xs: 5, md: 7, lg: 9 },
              alignItems: 'start',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                id="office-heading"
                variant="h2"
                sx={{ fontSize: { xs: '2.25rem', sm: '3rem', md: '3.75rem' }, maxWidth: 760 }}
              >
                Representation built around <Box component="span" sx={{ color: 'primary.main' }}>access</Box>
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 2.5, maxWidth: 710, fontSize: { xs: '1rem', md: '1.08rem' }, lineHeight: 1.78 }}
              >
                {trimAtSentence(settings?.about || settings?.intro || 'This office helps citizens reach their elected representative, understand ongoing public work, and receive responses through structured service channels.', 60)}
              </Typography>

              <Box
                sx={{
                  mt: { xs: 4, md: 5 },
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: activeMandate === 'mission' ? '1.13fr 0.87fr' : '0.87fr 1.13fr',
                  },
                  overflow: 'hidden',
                  borderRadius: 2,
                  bgcolor: 'primary.dark',
                  color: 'primary.contrastText',
                  position: 'relative',
                  transition: 'grid-template-columns 420ms var(--site-ease)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: '0 0 auto',
                    height: 4,
                    bgcolor: 'secondary.main',
                  },
                }}
              >
                {[
                  { id: 'mission', title: 'Mission', points: missionPoints, icon: FlagOutlined },
                  { id: 'vision', title: 'Vision', points: visionPoints, icon: VisibilityOutlined },
                ].map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeMandate === item.id;
                  return (
                    <Box
                      key={item.id}
                      role="button"
                      tabIndex={0}
                      aria-pressed={isActive}
                      onMouseEnter={() => setActiveMandate(item.id)}
                      onFocus={() => setActiveMandate(item.id)}
                      onClick={() => setActiveMandate(item.id)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setActiveMandate(item.id);
                        }
                      }}
                      sx={{
                        p: { xs: 3, md: 3.5 },
                        pt: { xs: 3.5, md: 4 },
                        borderTop: { xs: index ? '1px solid rgba(255,255,255,0.13)' : 0, sm: 0 },
                        borderLeft: { xs: 0, sm: index ? '1px solid rgba(255,255,255,0.13)' : 0 },
                        bgcolor: isActive ? 'rgba(255,255,255,0.065)' : 'transparent',
                        cursor: 'pointer',
                        outline: 0,
                        transition: 'background-color 260ms var(--site-ease)',
                        '&:focus-visible': { boxShadow: 'inset 0 0 0 3px rgba(214,154,53,0.72)' },
                        '& .mandate-icon': {
                          transform: isActive ? 'translateY(-2px) rotate(-4deg)' : 'none',
                          bgcolor: isActive ? 'secondary.main' : 'rgba(255,255,255,0.1)',
                          color: isActive ? 'secondary.contrastText' : 'secondary.light',
                        },
                        '& .mandate-arrow': {
                          opacity: isActive ? 1 : 0.35,
                          transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                        <Box
                          className="mandate-icon"
                          sx={{
                            width: 42,
                            height: 42,
                            display: 'grid',
                            placeItems: 'center',
                            borderRadius: 1.25,
                            flexShrink: 0,
                            transition: 'transform 260ms var(--site-ease), background-color 260ms var(--site-ease), color 260ms var(--site-ease)',
                          }}
                        >
                          <Icon fontSize="small" />
                        </Box>
                        <Typography variant="h5" sx={{ color: 'inherit' }}>{item.title}</Typography>
                        <ArrowForward
                          className="mandate-arrow"
                          sx={{ ml: 'auto !important', fontSize: 19, color: 'secondary.light', transition: 'transform 260ms var(--site-ease), opacity 260ms var(--site-ease)' }}
                        />
                      </Stack>
                      <Stack spacing={1.4} sx={{ mt: 2.2 }}>
                        {item.points.slice(0, 2).map((point) => (
                          <Typography
                            key={point}
                            sx={{
                              color: isActive ? 'rgba(248,251,249,0.88)' : 'rgba(248,251,249,0.65)',
                              lineHeight: 1.65,
                              transition: 'color 260ms var(--site-ease)',
                            }}
                          >
                            {trimWords(point, 36)}
                          </Typography>
                        ))}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box
              component="aside"
              aria-labelledby="priorities-heading"
              sx={{
                minWidth: 0,
                bgcolor: 'background.paper',
                p: { xs: 3, sm: 4, md: 4.5 },
                borderRadius: 2,
                boxShadow: '0 8px 0 rgba(23, 96, 68, 0.07)',
              }}
            >
              <Box sx={{ width: 48, height: 4, bgcolor: 'secondary.main', mb: 2.5 }} />
              <Typography id="priorities-heading" variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.15rem' } }}>
                Office commitments
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 480 }}>
                Explore the priorities and principles shaping public service and national policy work.
              </Typography>

              <Box
                role="tablist"
                aria-label="Office commitments"
                sx={{
                  mt: 2.8,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                  gap: 0.5,
                  p: 0.5,
                  borderRadius: 999,
                  bgcolor: alpha('#176044', 0.075),
                }}
              >
                {[
                  { id: 'priorities', label: 'Priorities' },
                  { id: 'principles', label: 'Principles' },
                ].map((tab) => {
                  const isSelected = briefView === tab.id;
                  return (
                    <Box
                      key={tab.id}
                      component="button"
                      type="button"
                      role="tab"
                      id={`office-tab-${tab.id}`}
                      aria-selected={isSelected}
                      aria-controls={`office-panel-${tab.id}`}
                      tabIndex={isSelected ? 0 : -1}
                      onClick={() => setBriefView(tab.id)}
                      onFocus={() => setBriefView(tab.id)}
                      onMouseEnter={() => setBriefView(tab.id)}
                      onKeyDown={(event) => {
                        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
                        event.preventDefault();
                        const nextView = tab.id === 'priorities' ? 'principles' : 'priorities';
                        setBriefView(nextView);
                        window.requestAnimationFrame(() => document.getElementById(`office-tab-${nextView}`)?.focus());
                      }}
                      sx={{
                        minHeight: 42,
                        border: 0,
                        borderRadius: 999,
                        px: 2,
                        bgcolor: isSelected ? 'primary.main' : 'transparent',
                        color: isSelected ? 'primary.contrastText' : 'primary.dark',
                        font: 'inherit',
                        fontWeight: 800,
                        cursor: 'pointer',
                        transition: 'background-color 220ms var(--site-ease), color 220ms var(--site-ease), transform 220ms var(--site-ease)',
                        '&:hover': { transform: 'translateY(-1px)' },
                        '&:focus-visible': { outline: '3px solid', outlineColor: alpha('#d69a35', 0.5), outlineOffset: 2 },
                      }}
                    >
                      {tab.label}
                    </Box>
                  );
                })}
              </Box>

              <Box
                key={briefView}
                role="tabpanel"
                id={`office-panel-${briefView}`}
                aria-labelledby={`office-tab-${briefView}`}
                sx={{
                  mt: 2.2,
                  animation: 'office-brief-enter 320ms var(--site-ease) both',
                  '@keyframes office-brief-enter': {
                    from: { opacity: 0, transform: 'translateX(12px)', filter: 'blur(2px)' },
                    to: { opacity: 1, transform: 'translateX(0)', filter: 'blur(0)' },
                  },
                }}
              >
                {briefView === 'priorities' ? (
                  <Stack spacing={0}>
                    {achievements.slice(0, 5).map((item) => (
                      <Box
                        key={item}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '38px minmax(0, 1fr)',
                          gap: 1.5,
                          alignItems: 'start',
                          py: 1.8,
                          px: 0.5,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          transition: 'transform 240ms var(--site-ease), background-color 240ms var(--site-ease)',
                          '&:hover': { transform: 'translateX(5px)', bgcolor: alpha('#176044', 0.035) },
                        }}
                      >
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha('#176044', 0.09),
                            color: 'primary.main',
                          }}
                        >
                          <ArrowForward sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography sx={{ pt: 0.45, fontWeight: 680, lineHeight: 1.55, minWidth: 0 }}>
                          {trimWords(item, 20)}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Box>
                    <Stack direction="row" spacing={1.2} sx={{ mb: 1.2, alignItems: 'center', color: 'primary.dark' }}>
                      <VerifiedOutlined fontSize="small" />
                      <Typography variant="h6">Principles in practice</Typography>
                    </Stack>
                    <Stack spacing={0}>
                      {principles.map((principle, index) => {
                        const isExpanded = activePrinciple === index;
                        const panelId = `principle-panel-${index}`;
                        const triggerId = `principle-trigger-${index}`;
                        return (
                          <Box
                            key={`${principle.title}-${principle.description}`}
                            onMouseEnter={() => setActivePrinciple(index)}
                            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                          >
                            <Box
                              component="button"
                              type="button"
                              id={triggerId}
                              aria-expanded={isExpanded}
                              aria-controls={panelId}
                              onClick={() => setActivePrinciple(isExpanded ? -1 : index)}
                              onFocus={() => setActivePrinciple(index)}
                              sx={{
                                width: '100%',
                                display: 'grid',
                                gridTemplateColumns: '10px minmax(0, 1fr) 28px',
                                gap: 1.25,
                                alignItems: 'center',
                                py: 2,
                                px: 0.5,
                                border: 0,
                                bgcolor: 'transparent',
                                color: 'text.primary',
                                font: 'inherit',
                                textAlign: 'left',
                                cursor: 'pointer',
                                '&:focus-visible': { outline: '3px solid', outlineColor: alpha('#d69a35', 0.5), outlineOffset: -2 },
                              }}
                            >
                              <Box component="span" sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'secondary.main' }} />
                              <Box component="span" sx={{ fontWeight: 800, lineHeight: 1.45 }}>{principle.title}</Box>
                              <ArrowForward
                                sx={{
                                  fontSize: 19,
                                  color: 'primary.main',
                                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                  transition: 'transform 300ms var(--site-ease)',
                                }}
                              />
                            </Box>
                            <Box
                              id={panelId}
                              role="region"
                              aria-labelledby={triggerId}
                              sx={{
                                display: 'grid',
                                gridTemplateRows: isExpanded ? '1fr' : '0fr',
                                opacity: isExpanded ? 1 : 0,
                                transition: 'grid-template-rows 360ms var(--site-ease), opacity 220ms var(--site-ease)',
                              }}
                            >
                              <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ pb: 2.2, pl: 2.25, pr: 4.5 }}>
                                  {principle.description || 'A commitment that guides constituency service and public decision-making.'}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
      )}

      <Box component="section" aria-labelledby="news-heading" sx={{ py: { xs: 7, md: 11 }, bgcolor: alpha('#176044', 0.045), borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'end' }, mb: 4 }}>
            <Box>
              <Typography id="news-heading" variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.5rem' } }}>Latest from the office</Typography>
              <Typography color="text.secondary" sx={{ mt: 1.5 }}>Official news, constituency work, and public announcements.</Typography>
            </Box>
            <Button component={RouterLink} to="/news" variant="outlined" endIcon={<ArrowForward />}>All news</Button>
          </Stack>

          {loadError && (
            <Alert severity="info" sx={{ mb: 3 }}>Live updates are temporarily unavailable. The rest of the public portal remains available.</Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.35fr 0.65fr' }, gap: 2.5 }}>
              <Skeleton variant="rounded" height={410} />
              <Stack spacing={2.5}><Skeleton variant="rounded" height={192} /><Skeleton variant="rounded" height={192} /></Stack>
            </Box>
          ) : featuredNews.length > 0 ? (
            <NewsGrid items={featuredNews.slice(0, 3)} />
          ) : (
            <Box sx={{ py: 5, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h5">No featured updates yet</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>Published stories will appear here when they are marked as featured.</Typography>
            </Box>
          )}
        </Container>
      </Box>

      {feedbacks.length > 0 && (
        <Box component="section" aria-labelledby="feedback-heading" sx={{ py: { xs: 7, md: 11 } }}>
          <Container>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 0.45fr) minmax(0, 1fr)' }, gap: { xs: 3, md: 7 }, alignItems: 'start' }}>
              <Box>
                <Typography id="feedback-heading" variant="h2" sx={{ fontSize: { xs: '2.1rem', md: '3rem' } }}>Community feedback</Typography>
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>Experiences shared through the public office.</Typography>
              </Box>
              <Box sx={{ borderLeft: { md: '4px solid' }, borderColor: { md: 'secondary.main' }, pl: { md: 4 } }}>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.45rem', md: '2rem' }, maxWidth: 760 }}>
                  “{trimWords(feedbacks[0].quote, 32)}”
                </Typography>
                <Typography sx={{ mt: 2, fontWeight: 800 }}>{cleanDisplayText(feedbacks[0].name)}</Typography>
                {feedbacks[0].location && (
                  <Typography color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, mt: 0.4 }}>
                    <Room sx={{ fontSize: 17 }} /> {cleanDisplayText(feedbacks[0].location)}
                  </Typography>
                )}
              </Box>
            </Box>
          </Container>
        </Box>
      )}

      <Container sx={{ py: { xs: 2, md: 4 } }}>
        <Box
          className="scroll-reveal"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
            gap: 3,
            alignItems: 'center',
            bgcolor: 'secondary.main',
            color: 'secondary.contrastText',
            borderRadius: 2,
            p: { xs: 3, md: 5 },
          }}
        >
          <Box>
            <Typography variant="h3" sx={{ color: 'inherit', fontSize: { xs: '1.9rem', md: '2.8rem' } }}>See development work in your area</Typography>
            <Typography sx={{ mt: 1.2, maxWidth: 680, color: alpha('#17251f', 0.78) }}>
              Browse schemes by union council, category, and status through the public portfolio.
            </Typography>
          </Box>
          <Button component={RouterLink} to="/schemes" variant="contained" color="primary" endIcon={<ArrowOutward />}>
            Explore schemes
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

function NewsGrid({ items }) {
  const [lead, ...rest] = items;

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: rest.length ? 'minmax(0, 1.35fr) minmax(300px, 0.65fr)' : '1fr' }, gap: 2.5 }}>
      <NewsStory item={lead} lead />
      {rest.length > 0 && (
        <Stack spacing={2.5}>
          {rest.map((item) => <NewsStory key={item.id} item={item} />)}
        </Stack>
      )}
    </Box>
  );
}

function NewsStory({ item, lead = false }) {
  const image = getNewsImage(item);
  return (
    <Box
      component={RouterLink}
      to={`/news/${item.id}`}
      className="scroll-reveal"
      sx={{
        minHeight: lead ? { xs: 400, md: 520 } : { xs: 290, md: 248 },
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        overflow: 'hidden',
        borderRadius: 2,
        bgcolor: 'primary.dark',
        color: '#f7faf8',
        isolation: 'isolate',
        '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main', outlineOffset: 3 },
        '&:hover img': { transform: 'scale(1.025)' },
      }}
    >
      {image ? (
        <Box component="img" src={image} alt="" loading="lazy" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 500ms var(--site-ease)', zIndex: -2 }} />
      ) : (
        <Newspaper sx={{ position: 'absolute', right: 24, top: 24, fontSize: lead ? 72 : 48, color: 'rgba(255,255,255,0.18)', zIndex: -1 }} />
      )}
      <Box sx={{ position: 'absolute', inset: 0, background: image ? 'linear-gradient(180deg, rgba(9,35,25,0.04) 20%, rgba(9,35,25,0.92) 100%)' : 'linear-gradient(135deg, #0e3f2d, #176044)', zIndex: -1 }} />
      <Box sx={{ p: { xs: 2.5, md: lead ? 4 : 2.7 }, width: '100%' }}>
        <Typography variant="body2" sx={{ color: 'rgba(247,250,248,0.74)', fontWeight: 700 }}>
          {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Official update'}
        </Typography>
        <Typography
          variant={lead ? 'h3' : 'h5'}
          sx={{
            mt: 0.8,
            color: 'inherit',
            maxWidth: lead ? 760 : 520,
            fontSize: lead ? { xs: '1.8rem', md: '2.65rem' } : undefined,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: lead ? 3 : 2,
            overflow: 'hidden',
          }}
        >
          {cleanDisplayText(item.title)}
        </Typography>
        {lead && <Typography sx={{ mt: 1.1, color: 'rgba(247,250,248,0.76)', maxWidth: 650 }}>{summarizeNews(item)}</Typography>}
      </Box>
    </Box>
  );
}
