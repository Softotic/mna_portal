import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, Grid, LinearProgress, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { publicNewsAPI } from '../api/index.js';

export default function PublicNewsDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('News ID not provided');
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      setError('');
      try {
        const response = await publicNewsAPI.get(id);
        setNews(response.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load news article.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return <LinearProgress />;
  }

  if (error || !news) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
        <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            {error || 'News article not found'}
          </Typography>
          <Button onClick={() => navigate('/news')} sx={{ textTransform: 'none', fontWeight: 600 }}>
            Back to news
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
        <Button
          onClick={() => navigate('/news')}
          startIcon={<ArrowBack />}
          sx={{ textTransform: 'none', fontWeight: 600, mb: 4 }}
        >
          Back to news
        </Button>

        <Card sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 12px 40px rgba(15, 23, 42, 0.08)' }}>
          {news.image && (
            <CardMedia component="img" height="500" image={news.image} alt={news.title} sx={{ objectFit: 'cover' }} />
          )}
          <CardContent sx={{ p: { xs: 4, md: 6 } }}>
            <Typography variant="overline" sx={{ color: '#0a3712', letterSpacing: 1.2, fontWeight: 700, mb: 2, display: 'block' }}>
              Published {new Date(news.published_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>

            <Typography variant="h2" sx={{ fontWeight: 800, mb: 3, lineHeight: 1.2 }}>
              {news.title}
            </Typography>

            {news.excerpt && (
              <Typography variant="h5" sx={{ color: '#666', fontWeight: 300, mb: 4, lineHeight: 1.7 }}>
                {news.excerpt}
              </Typography>
            )}

            <Box sx={{ my: 4, borderTop: '1px solid #e0e7dd', borderBottom: '1px solid #e0e7dd', py: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Status
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, textTransform: 'capitalize' }}>
                    {news.status}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Published
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {news.published_at ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Featured
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {news.featured ? 'Yes' : 'No'}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Updated
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {new Date(news.updated_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            <Typography
              variant="body1"
              sx={{
                color: '#333',
                lineHeight: 2,
                fontSize: '1.1rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {news.content}
            </Typography>

            <Box sx={{ mt: 6, pt: 4, borderTop: '1px solid #e0e7dd' }}>
              <Button
                onClick={() => navigate('/news')}
                variant="outlined"
                startIcon={<ArrowBack />}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Back to all news
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
