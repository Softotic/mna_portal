import { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, Grid, Typography, LinearProgress, Paper } from '@mui/material';
import { ArrowForward } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { publicSettingsAPI, publicNewsAPI } from '../api/index.js';

export default function PublicLandingPage() {
  const [settings, setSettings] = useState(null);
  const [featuredNews, setFeaturedNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const [settingsRes, newsRes] = await Promise.all([
          publicSettingsAPI.current(),
          publicNewsAPI.featured(),
        ]);
        setSettings(settingsRes.data || {});
        const newsData = newsRes.data;
        setFeaturedNews(Array.isArray(newsData) ? newsData : newsData?.results || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load public website content.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <LinearProgress />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {error}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please refresh the page or check your internet connection.
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa' }}>
      <Box sx={{ bgcolor: '#0d3b0f', color: '#fff', py: { xs: 5, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h3" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.05 }}>
                {settings?.site_name || 'MNA'}
              </Typography>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 300, color: '#e1e8df' }}>
                {settings?.site_message || 'A dynamic public portal for MNA news and updates.'}
              </Typography>
              <Button
                component={RouterLink}
                to="/news"
                variant="contained"
                size="large"
                sx={{ textTransform: 'none', fontWeight: 700 }}
                endIcon={<ArrowForward />}
              >
                See All News
              </Button>
            </Grid>
            {settings?.intro_image && (
              <Grid item xs={12} md={6}>
                <CardMedia
                  component="img"
                  image={settings.intro_image}
                  alt="Intro"
                  sx={{ borderRadius: 3, boxShadow: '0 16px 40px rgba(0,0,0,0.2)' }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {settings?.intro && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
              Introduction
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 860, mx: 'auto', color: '#4a4a4a', lineHeight: 1.8 }}>
              {settings.intro}
            </Typography>
          </Box>
        )}

        {featuredNews.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
              Latest News
            </Typography>
            <Grid container spacing={3}>
              {featuredNews.map((news) => (
                <Grid item xs={12} md={4} key={news.id}>
                  <Card sx={{ borderRadius: 3, height: '100%', transition: 'transform 0.25s ease', '&:hover': { transform: 'translateY(-6px)' } }}>
                    {news.image && (
                      <CardMedia component="img" height="200" image={news.image} alt={news.title} />
                    )}
                    <CardContent>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                        {news.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {news.excerpt || 'Read the full update on the news page.'}
                      </Typography>
                      <Button component={RouterLink} to="/news" size="small" sx={{ textTransform: 'none' }}>
                        View all news
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        <Grid container spacing={3}>
          {settings?.vision && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Vision
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {settings.vision}
                </Typography>
              </Paper>
            </Grid>
          )}
          {settings?.mission && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Mission
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {settings.mission}
                </Typography>
              </Paper>
            </Grid>
          )}
          {settings?.values && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Values
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {settings.values}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {settings?.about && (
        <Box sx={{ bgcolor: '#fff', py: { xs: 4, md: 8 } }}>
          <Container maxWidth="lg">
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
              About Us
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 860, mx: 'auto', color: '#4a4a4a', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
              {settings.about}
            </Typography>
          </Container>
        </Box>
      )}

      <Box sx={{ bgcolor: '#0f2611', color: '#fff', py: 4 }}>
        <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: { xs: 'column', md: 'row' } }}>
          <Typography variant="body2">© {new Date().getFullYear()} {settings.site_name || 'MNA'}. All rights reserved.</Typography>
          <Button component={RouterLink} to="/news" color="inherit" sx={{ textTransform: 'none', mt: { xs: 2, md: 0 } }}>
            Browse News
          </Button>
        </Container>
      </Box>
    </Box>
  );
}
