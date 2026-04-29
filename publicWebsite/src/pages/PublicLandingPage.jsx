import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowOutward,
  Campaign,
  Feedback,
  Newspaper,
  Public,
  Room,
  SupportAgent,
} from '@mui/icons-material';
import { Facebook, Instagram, Language, YouTube } from '@mui/icons-material';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { publicFeedbacksAPI, publicNewsAPI } from '../api/index.js';

function toList(value, fallback) {
  const list = value
    ?.split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return list?.length ? list : fallback;
}

export default function PublicLandingPage() {
  const { settings } = useOutletContext();
  const [featuredNews, setFeaturedNews] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const achievements = useMemo(
    () =>
      toList(settings?.achievements, [
        'Accessible constituency support',
        'Transparent complaint tracking',
        'Visible public communication',
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

  const socials = [
    { href: settings?.facebook_url, label: 'Facebook', icon: <Facebook fontSize="small" /> },
    { href: settings?.instagram_url, label: 'Instagram', icon: <Instagram fontSize="small" /> },
    { href: settings?.youtube_url, label: 'YouTube', icon: <YouTube fontSize="small" /> },
    { href: settings?.website_url, label: 'Website', icon: <Language fontSize="small" /> },
  ].filter((item) => item.href);

  return (
    <Box>
      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(16,36,27,0.08)',
          background:
            'linear-gradient(180deg, rgba(220,235,220,0.65) 0%, rgba(255,253,248,0.98) 100%)',
        }}
      >
        <Container sx={{ py: { xs: 5, sm: 7, md: 9 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.05fr) minmax(360px, 0.75fr)' },
              gap: { xs: 4, md: 6 },
              alignItems: 'center',
            }}
          >
            <Box sx={{ minWidth: 0, maxWidth: { xs: 'calc(100vw - 32px)', lg: 'none' }, padding: { xs: 0, md: 6 } }}>
              <Chip
                label={settings?.constituency || 'Official Constituency Portal'}
                sx={{ alignSelf: 'flex-start', bgcolor: alpha('#1f5f46', 0.10), color: 'primary.main', mb: 2.5 }}
              />
              <Typography
                variant="h1"
                sx={{
                  maxWidth: 900,
                  fontSize: { xs: '2.35rem', sm: '3.7rem', md: '5.2rem' },
                  lineHeight: { xs: 1.05, md: 1.02 },
                  overflowWrap: 'anywhere',
                }}
              >
                {settings?.leader_name || settings?.site_name || 'Member of the National Assembly'}
              </Typography>
              <Typography
                variant="h4"
                sx={{
                  mt: 1.5,
                  maxWidth: 760,
                  color: 'primary.main',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.7rem' },
                  overflowWrap: 'anywhere',
                }}
              >
                {settings?.designation || 'Member of the National Assembly'}{settings?.constituency ? ` for ${settings.constituency}` : ''}
              </Typography>
              <Typography sx={{ mt: 2.5, maxWidth: 760, color: 'text.secondary', fontSize: '1.06rem', overflowWrap: 'break-word' }}>
                {settings?.hero_statement ||
                  settings?.site_message ||
                  'A public service platform built for the people of Pakistan, with direct access to complaints, updates, feedback, and office communication.'}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3.5, alignItems: { xs: 'stretch', sm: 'center' } }}>
                <Button component={RouterLink} to="/complaints" variant="contained" color="secondary" endIcon={<ArrowOutward />} sx={{ minWidth: 0 }}>
                  Submit a Complaint
                </Button>
                <Button component={RouterLink} to="/news" variant="outlined" endIcon={<ArrowOutward />} sx={{ minWidth: 0 }}>
                  Read News Updates
                </Button>
              </Stack>
              {socials.length > 0 && (
                <Stack direction="row" spacing={1.2} sx={{ mt: 3, flexWrap: 'wrap' }} useFlexGap>
                  {socials.map((item) => (
                    <Button
                      key={item.label}
                      component="a"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      variant="text"
                      startIcon={item.icon}
                      sx={{ px: 0.5 }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>
              )}
            </Box>

            <Box sx={{ minWidth: 0, maxWidth: { xs: 'calc(100vw - 32px)', lg: 'none' }, padding: { xs: 0, md: 8 } }}>
              <Paper
                sx={{
                  borderRadius: { xs: 3, md: 5 },
                  p: { xs: 2, md: 3 },
                  border: '1px solid rgba(16,36,27,0.08)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(220,235,220,0.66) 100%)',
                }}
              >
                {settings?.intro_image ? (
                  <CardMedia
                    component="img"
                    image={settings.intro_image}
                    alt={settings?.leader_name || settings?.site_name || 'MNA portrait'}
                    sx={{ borderRadius: { xs: 3, md: 5 }, aspectRatio: { xs: '4 / 4.15', md: '4 / 4.7' }, objectFit: 'cover', mb: 3 }}
                  />
                ) : (
                  <Box
                    sx={{
                      borderRadius: 5,
                      aspectRatio: '4 / 4.7',
                      mb: 3,
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      color: 'white',
                      background: 'linear-gradient(145deg, #153426 0%, #2f7f5b 60%, #b48a43 170%)',
                    }}
                  >
                    <Campaign sx={{ fontSize: 48 }} />
                    <Typography
                      variant="h4"
                      sx={{
                        color: 'white',
                        maxWidth: { xs: 260, md: 320 },
                        fontSize: { xs: '1.9rem', sm: '2.15rem', md: '2.35rem' },
                        lineHeight: 1.05,
                        overflowWrap: 'break-word',
                      }}
                    >
                      Representation with purpose, dignity, and local accountability
                    </Typography>
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                    gap: 1.5,
                  }}
                >
                  {[
                    // { label: 'Constituency', value: settings?.constituency || 'Configured in admin' },
                    { label: 'District', value: settings?.district || 'Local office' },
                    { label: 'Citizen Portal', value: 'Active' },
                  ].map((item) => (
                    <Box key={item.label}>
                      <Box
                        sx={{
                          p: 1.8,
                          borderRadius: 3,textAlign: 'center',
                        
                          border: '1px solid rgba(16,36,27,0.08)',
                          bgcolor: 'rgba(255,255,255,0.78)',
                        }}
                      >
                        <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ fontWeight: 800, mt: 0.4 }}>{item.value}</Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 6, md: 9 }, px: { xs: 3, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 3,
          }}
        >
          {[
            {
              title: 'Complaints & Support',
              text: 'A direct route for the public to submit concerns, attach supporting material, and track progress with a complaint number.',
              icon: <SupportAgent fontSize="small" />,
            },
            {
              title: 'News & Public Updates',
              text: 'A reliable feed of statements, development work, office activity, and news relevant to constituents.',
              icon: <Newspaper fontSize="small" />,
            },
            {
              title: 'Feedback from People',
              text: 'Citizen voices and community feedback that reflect how public service is experienced on the ground.',
              icon: <Feedback fontSize="small" />,
            },
          ].map((item, index) => (
            <Box key={item.title}>
              <Paper sx={{ p: 3.2, border: '1px solid rgba(16,36,27,0.08)', height: '100%' }}>
                <Typography variant="overline" color="secondary.main">
                  0{index + 1}
                </Typography>
                <Typography variant="h6" sx={{ mt: 1.1, mb: 1.1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>{item.icon}</Box>
                  {item.title}
                </Typography>
                <Typography color="text.secondary">{item.text}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>
      </Container>

      <Container sx={{ pb: { xs: 5, md: 7 }, px: { xs: 3, md: 8 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(300px, 420px)' },
            gap: { xs: 3, md: 5 },
            alignItems: 'center',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" color="secondary.main">
              About the Office
            </Typography>
            <Typography variant="h3" sx={{ mt: 1.3, mb: 2.2, maxWidth: 740 }}>
              A public-facing office for representation, responsiveness, and measurable local service
            </Typography>
            <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
              {settings?.about ||
                settings?.intro ||
                'This website is designed to help citizens stay connected with the work of their elected representative, access the office more easily, and receive responses through structured public-service channels.'}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Paper sx={{ p: 3.2, border: '1px solid rgba(16,36,27,0.08)' }}>
              <Typography variant="overline" color="secondary.main">
                Public Priorities
              </Typography>
              <Stack spacing={1.4} sx={{ mt: 2 }}>
                {achievements.map((item) => (
                  <Box
                    key={item}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: alpha('#1f5f46', 0.05),
                      borderLeft: '3px solid rgba(180,138,67,0.76)',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{item}</Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Container>

      <Box sx={{ borderTop: '1px solid rgba(16,36,27,0.08)', borderBottom: '1px solid rgba(16,36,27,0.08)', bgcolor: alpha('#dcebdc', 0.32) }}>
        <Container sx={{ py: { xs: 5, md: 7 }, px: { xs: 3, md: 8 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(240px, 0.8fr) minmax(0, 1.4fr) minmax(220px, 0.7fr)' },
              gap: 3,
              alignItems: 'stretch',
            }}
          >
            <Box>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1.2 }}>
                    Office Contact
                  </Typography>
                  {settings?.office_address && (
                    <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap', mb: 1.4 }}>
                      {settings.office_address}
                    </Typography>
                  )}
                  {settings?.office_hours && (
                    <Typography color="text.secondary" sx={{ mb: 1.4 }}>
                      {settings.office_hours}
                    </Typography>
                  )}
                  {settings?.contact_phone && <Typography color="text.secondary">{settings.contact_phone}</Typography>}
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1.2 }}>
                    For the People
                  </Typography>
                  <Typography color="text.secondary">
                    This portal is meant to make public service easier to access, more transparent, and more respectful for citizens.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
            <Box>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 1.2 }}>
                    Direct Access
                  </Typography>
                  <Stack spacing={1.2}>
                    <Button component={RouterLink} to="/complaints" variant="outlined" startIcon={<SupportAgent />}>
                      Complaint Portal
                    </Button>
                    <Button component={RouterLink} to="/news" variant="outlined" startIcon={<Newspaper />}>
                      Newsroom
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 6, md: 8 }, px: { xs: 3, md: 8 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 3 }}>
          <Box>
            <Typography variant="overline" color="secondary.main">
              Latest Updates
            </Typography>
            <Typography variant="h3" sx={{ mt: 1.2 }}>
              News from the constituency and public office
            </Typography>
          </Box>
          <Button component={RouterLink} to="/news" variant="outlined" endIcon={<ArrowOutward />}>
            View all news
          </Button>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 3,
          }}
        >
          {featuredNews.length > 0 ? (
            featuredNews.slice(0, 3).map((item, index) => (
              <Box key={item.id} sx={{ gridColumn: { xs: 'auto', md: index === 0 ? 'span 2' : 'span 1' } }}>
                <Card sx={{ height: '100%' }}>
                  {item.image ? (
                    <CardMedia component="img" image={item.image} alt={item.title} sx={{ height: index === 0 ? 320 : 220, objectFit: 'cover' }} />
                  ) : (
                    <Box sx={{ height: index === 0 ? 320 : 220, bgcolor: alpha('#1f5f46', 0.08) }} />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="overline" color="secondary.main">
                      {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Official update'}
                    </Typography>
                    <Typography variant={index === 0 ? 'h5' : 'h6'} sx={{ mt: 1, mb: 1.2 }}>
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {item.excerpt || 'Open the full story to continue reading.'}
                    </Typography>
                    <Button component={RouterLink} to={`/news/${item.id}`} endIcon={<ArrowOutward />}>
                      Read update
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Paper sx={{ p: 4, border: '1px solid rgba(16,36,27,0.08)' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  News publishing is ready
                </Typography>
                <Typography color="text.secondary">
                  Published and featured stories from the admin panel will appear here automatically.
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Container>

      <Container sx={{ pb: 8, px: { xs: 3, md: 8 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'end', flexWrap: 'wrap', mb: 3 }}>
          <Box>
            <Typography variant="overline" color="secondary.main">
              Citizen Feedback
            </Typography>
            <Typography variant="h3" sx={{ mt: 1.2 }}>
              Voices from the community
            </Typography>
          </Box>
          <Typography color="text.secondary" sx={{ maxWidth: 520 }}>
            Public feedback and community sentiment can be managed from the admin panel and highlighted here.
          </Typography>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            gap: 3,
          }}
        >
          {feedbacks.length > 0 ? (
            feedbacks.slice(0, 3).map((item) => (
              <Box key={item.id}>
                <Paper sx={{ p: 3.2, border: '1px solid rgba(16,36,27,0.08)', height: '100%' }}>
                  <Typography variant="h6" sx={{ mb: 1.4 }}>
                    “{item.quote}”
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontWeight: 700 }}>
                    {item.name}
                  </Typography>
                  {item.location && (
                    <Typography color="text.secondary" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.6, mt: 0.5 }}>
                      <Room sx={{ fontSize: 16 }} />
                      {item.location}
                    </Typography>
                  )}
                </Paper>
              </Box>
            ))
          ) : (
            <Box sx={{ gridColumn: '1 / -1' }}>
              <Paper sx={{ p: 4, border: '1px solid rgba(16,36,27,0.08)' }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  Feedback section is ready
                </Typography>
                <Typography color="text.secondary">
                  Add published citizen feedback entries from the admin panel to show public voices here.
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Container>

      <Container sx={{ pb: 4, px: { xs: 3, md: 8 } }}>
        <Paper
          sx={{
            p: { xs: 3, md: 4 },
            border: '1px solid rgba(16,36,27,0.08)',
            background: 'linear-gradient(135deg, rgba(31,95,70,0.96) 0%, rgba(47,127,91,0.96) 100%)',
            color: 'white',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) auto' },
              gap: 3,
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.74)' }}>
                People First
              </Typography>
              <Typography variant="h4" sx={{ color: 'white', mt: 1 }}>
                Public service should feel open, responsive, and easy to reach
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.80)', mt: 1.5, maxWidth: 700 }}>
                Use the complaints portal for support, the newsroom for official updates, and the office channels for direct communication with the MNA team.
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button component={RouterLink} to="/complaints" variant="contained" color="secondary" endIcon={<Public />}>
                Reach the Office
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
