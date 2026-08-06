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
  Groups,
  Newspaper,
  QueryStats,
  Room,
  SupportAgent,
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

function cleanDisplayText(value) {
  return String(value || '').replace(/[\u2013\u2014]/g, '-');
}

function cleanLeaderName(value) {
  return cleanDisplayText(value).replace(/^about\s+/i, '').trim();
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

      <Box component="section" aria-labelledby="office-heading" sx={{ py: { xs: 7, md: 11 } }}>
        <Container>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.05fr) minmax(300px, 0.75fr)' }, gap: { xs: 5, lg: 10 }, alignItems: 'start' }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography id="office-heading" variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.6rem' }, maxWidth: 700 }}>
                Representation built around access
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2.2, maxWidth: 720, fontSize: '1.05rem' }}>
                {trimWords(settings?.about || settings?.intro || 'This office helps citizens reach their elected representative, understand ongoing public work, and receive responses through structured service channels.', 64)}
              </Typography>

              <Box sx={{ mt: 4.5, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5 }}>
                <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <Typography variant="h5" sx={{ color: 'inherit' }}>Mission</Typography>
                  <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                    {missionPoints.slice(0, 2).map((item) => <Typography key={item} sx={{ color: 'rgba(248,251,249,0.8)' }}>{trimWords(item, 26)}</Typography>)}
                  </Stack>
                </Box>
                <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: 2, bgcolor: 'primary.contrastText', border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h5">Vision</Typography>
                  <Stack spacing={1.2} sx={{ mt: 1.5 }}>
                    {visionPoints.slice(0, 2).map((item) => <Typography key={item} color="text.secondary">{trimWords(item, 26)}</Typography>)}
                  </Stack>
                </Box>
              </Box>
            </Box>

            <Box sx={{ minWidth: 0, borderTop: '4px solid', borderColor: 'secondary.main', bgcolor: 'primary.contrastText', p: { xs: 3, md: 4 }, borderRadius: 2 }}>
              <Typography variant="h5">Public priorities</Typography>
              <Stack spacing={0} sx={{ mt: 2.2 }}>
                {achievements.slice(0, 5).map((item) => (
                  <Box key={item} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', py: 1.6, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ArrowForward sx={{ mt: 0.25, color: 'primary.main', fontSize: 20, flexShrink: 0 }} />
                    <Typography sx={{ fontWeight: 650, minWidth: 0 }}>{trimWords(item, 18)}</Typography>
                  </Box>
                ))}
              </Stack>
              <Typography sx={{ mt: 3, fontWeight: 800, color: 'primary.dark' }}>Principles</Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mt: 1.4, minWidth: 0 }}>
                {values.slice(0, 4).map((item) => (
                  <Typography
                    key={item}
                    variant="body2"
                    sx={{
                      maxWidth: '100%',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 999,
                      px: 1.4,
                      py: 0.65,
                      fontWeight: 700,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {trimWords(item, 9)}
                  </Typography>
                ))}
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

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
