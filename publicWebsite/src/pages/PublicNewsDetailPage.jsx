import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  CardMedia,
  Chip,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowBack, ArrowOutward, Article, CalendarToday, ChevronLeft, ChevronRight, SupportAgent, Update } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { publicNewsAPI, resolveMediaUrl } from '../api/index.js';

export default function PublicNewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    if (!id) {
      setError('News article not found.');
      setLoading(false);
      return undefined;
    }

    (async () => {
      try {
        const response = await publicNewsAPI.get(id);
        if (active) {
          setNews(response.data);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setError('Unable to load this article.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <LinearProgress color="secondary" />;
  }

  if (error || !news) {
    return (
      <Container sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {error || 'News article not found.'}
        </Typography>
        <Button onClick={() => navigate('/news')} startIcon={<ArrowBack />}>
          Return to newsroom
        </Button>
      </Container>
    );
  }

  const gallery = [
    ...(news.image ? [{ id: 'primary', image: resolveMediaUrl(news.image) }] : []),
    ...(news.images || []),
  ];

  return (
    <Box sx={{ pb: { xs: 6, md: 10 }, px: { xs: 2, sm: 3, md: 6 } }}>
      <Container sx={{ pt: { xs: 4, md: 7 }, pb: { xs: 3, md: 5 } }}>
        <Button onClick={() => navigate('/news')} startIcon={<ArrowBack />} sx={{ mb: { xs: 2.5, md: 4 } }}>
          Back to newsroom
        </Button>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.96fr) minmax(280px, 0.32fr)' },
            gap: { xs: 3, md: 4.5 },
            alignItems: 'start',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack direction="row" spacing={1.2} sx={{ alignItems: 'center', flexWrap: 'wrap', mb: 2.4 }} useFlexGap>
              <Chip
                label="Official Article"
                sx={{
                  bgcolor: alpha('#1f5f46', 0.10),
                  color: 'primary.main',
                  fontWeight: 800,
                }}
              />
              <Typography variant="overline" sx={{ color: 'text.secondary' }}>
                Public news and updates
              </Typography>
            </Stack>
            <Typography
              variant="h2"
              sx={{
                maxWidth: 920,
                fontSize: { xs: '2.15rem', sm: '2.8rem', md: '3.55rem' },
                lineHeight: { xs: 1.1, md: 1.05 },
                letterSpacing: '-0.03em',
                overflowWrap: 'anywhere',
              }}
            >
              {news.title}
            </Typography>
            {news.excerpt && (
              <Typography
                color="text.secondary"
                sx={{
                  mt: 2.2,
                  maxWidth: 760,
                  fontSize: { xs: '1rem', md: '1.08rem' },
                  lineHeight: 1.8,
                }}
              >
                {news.excerpt}
              </Typography>
            )}
          </Box>

          <Paper
            sx={{
              p: { xs: 2.4, md: 3 },
              border: '1px solid rgba(16,36,27,0.08)',
              bgcolor: alpha('#fbfcfb', 0.94),
            }}
          >
            <Stack spacing={2}>
              {[
                {
                  icon: <CalendarToday fontSize="small" />,
                  label: 'Published',
                  value: news.published_at
                    ? new Date(news.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Not available',
                },
                {
                  icon: <Update fontSize="small" />,
                  label: 'Updated',
                  value: news.updated_at ? new Date(news.updated_at).toLocaleDateString() : 'Not available',
                },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr)', gap: 1.5 }}>
                  <Box sx={{ color: 'secondary.main', pt: 0.3 }}>{item.icon}</Box>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, mt: 0.2 }}>{item.value}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>
      </Container>

      <Container sx={{ pb: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            overflow: 'hidden',
            borderRadius: { xs: 3, md: 5 },
            border: '1px solid rgba(16,36,27,0.08)',
            boxShadow: '0 24px 58px rgba(16,36,27,0.09)',
            bgcolor: alpha('#1f5f46', 0.06),
          }}
        >
          {gallery.length > 0 ? (
            <NewsImageGallery images={gallery} title={news.title} activeImage={activeImage} setActiveImage={setActiveImage} />
          ) : (
            <Box
              sx={{
                minHeight: { xs: 250, sm: 360, md: 460 },
                p: { xs: 3, sm: 4, md: 6 },
                display: 'grid',
                alignItems: 'end',
                background:
                  'linear-gradient(135deg, rgba(223,236,229,0.92) 0%, rgba(245,247,245,0.98) 58%, rgba(214,154,53,0.15) 100%)',
              }}
            >
              <Box sx={{ maxWidth: 760 }}>
                <Box
                  sx={{
                    width: 62,
                    height: 62,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: alpha('#1f5f46', 0.10),
                    color: 'primary.main',
                    mb: 3,
                  }}
                >
                  <Article />
                </Box>
                <Typography variant="overline" color="secondary.main">
                  Official update
                </Typography>
                <Typography variant="h3" sx={{ mt: 1.2, maxWidth: 720 }}>
                  {news.title}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Container>

      <Container>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 860px) minmax(280px, 340px)' },
            gap: { xs: 4, md: 5 },
            alignItems: 'start',
            justifyContent: 'center',
          }}
        >
          <Paper
            sx={{
              p: { xs: 3, sm: 4, md: 6 },
              border: '1px solid rgba(16,36,27,0.08)',
              bgcolor: alpha('#fbfcfb', 0.96),
            }}
          >
            <Typography
              sx={{
                color: 'text.primary',
                lineHeight: { xs: 1.9, md: 1.95 },
                fontSize: { xs: '1rem', md: '1.08rem' },
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {news.content || news.excerpt || ''}
            </Typography>
          </Paper>

          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 96 } }}>
            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                border: '1px solid rgba(16,36,27,0.08)',
                background: 'linear-gradient(135deg, rgba(31,95,70,0.96) 0%, rgba(47,127,91,0.96) 100%)',
                color: 'white',
              }}
            >
              <SupportAgent sx={{ color: 'secondary.main', mb: 1.5 }} />
              <Typography variant="h6" sx={{ color: 'white', mb: 1 }}>
                Need support on a related issue?
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.78)', mb: 2.5 }}>
                Submit a complaint or service request through the public portal and receive a trackable case reference.
              </Typography>
              <Button onClick={() => navigate('/complaints')} variant="contained" color="secondary" endIcon={<ArrowOutward />}>
                Open Complaint Portal
              </Button>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function NewsImageGallery({ images, title, activeImage, setActiveImage }) {
  const hasSlideshow = images.length > 1;
  const current = images[activeImage] || images[0];
  const move = (direction) => {
    setActiveImage((index) => (index + direction + images.length) % images.length);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <CardMedia
        component="img"
        image={resolveMediaUrl(current.image)}
        alt={title}
        sx={{ width: '100%', height: { xs: 250, sm: 380, md: 560 }, objectFit: 'cover' }}
      />
      {hasSlideshow && (
        <>
          <IconButton
            aria-label="Previous image"
            onClick={() => move(-1)}
            sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.88)' }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            aria-label="Next image"
            onClick={() => move(1)}
            sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.88)' }}
          >
            <ChevronRight />
          </IconButton>
          <Stack
            direction="row"
            spacing={1}
            sx={{ position: 'absolute', left: 0, right: 0, bottom: 16, justifyContent: 'center' }}
          >
            {images.map((image, index) => (
              <Box
                key={image.id || image.image}
                component="button"
                aria-label={`Show image ${index + 1}`}
                onClick={() => setActiveImage(index)}
                sx={{
                  width: index === activeImage ? 26 : 9,
                  height: 9,
                  borderRadius: 999,
                  border: 0,
                  bgcolor: index === activeImage ? 'white' : 'rgba(255,255,255,0.58)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
