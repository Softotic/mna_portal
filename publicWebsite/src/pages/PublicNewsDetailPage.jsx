import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowBack, ArrowOutward } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { publicNewsAPI } from '../api/index.js';

export default function PublicNewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
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

  return (
    <Box sx={{ pb: { xs: 6, md: 9 } }}>
      <Container sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 3, md: 5 } }}>
        <Button onClick={() => navigate('/news')} startIcon={<ArrowBack />} sx={{ mb: 3 }}>
          Back to newsroom
        </Button>
        <Typography variant="overline" color="secondary.main">
          Official Article
        </Typography>
        <Typography variant="h2" sx={{ mt: 1.1, maxWidth: 920 }}>
          {news.title}
        </Typography>
        {news.excerpt && (
          <Typography color="text.secondary" sx={{ mt: 2.4, maxWidth: 780, fontSize: '1.05rem' }}>
            {news.excerpt}
          </Typography>
        )}
      </Container>

      <Container>
        <Card sx={{ overflow: 'hidden' }}>
          {news.image ? (
            <CardMedia component="img" image={news.image} alt={news.title} sx={{ height: { xs: 260, md: 520 }, objectFit: 'cover' }} />
          ) : (
            <Box sx={{ height: { xs: 260, md: 360 }, bgcolor: alpha('#1f5f46', 0.08) }} />
          )}

          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 2.5,
                mb: { xs: 3.5, md: 5 },
              }}
            >
              {[
                {
                  label: 'Published',
                  value: news.published_at
                    ? new Date(news.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Not available',
                },
                {
                  label: 'Status',
                  value: news.status ? news.status.replace(/_/g, ' ') : 'Published',
                },
                {
                  label: 'Updated',
                  value: news.updated_at ? new Date(news.updated_at).toLocaleDateString() : 'Not available',
                },
              ].map((item) => (
                <Box key={item.label}>
                  <Paper sx={{ p: 2.4, border: '1px solid rgba(16,36,27,0.08)' }}>
                    <Typography variant="overline" color="secondary.main">
                      {item.label}
                    </Typography>
                    <Typography sx={{ mt: 0.8, fontWeight: 700, textTransform: 'capitalize' }}>
                      {item.value}
                    </Typography>
                  </Paper>
                </Box>
              ))}
            </Box>

            <Typography
              sx={{
                color: 'text.primary',
                lineHeight: 2,
                fontSize: '1.08rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxWidth: 900,
                mx: 'auto',
              }}
            >
              {news.content}
            </Typography>

            <Paper
              sx={{
                mt: 5,
                p: { xs: 2.5, md: 3.5 },
                border: '1px solid rgba(16,36,27,0.08)',
                background: 'linear-gradient(135deg, rgba(220,235,220,0.60) 0%, rgba(255,255,255,0.96) 100%)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                Need support on a related issue?
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Citizens can submit a complaint or service request through the public complaint portal and receive a trackable case reference.
              </Typography>
              <Button onClick={() => navigate('/complaints')} variant="contained" color="secondary" endIcon={<ArrowOutward />}>
                Open Complaint Portal
              </Button>
            </Paper>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
