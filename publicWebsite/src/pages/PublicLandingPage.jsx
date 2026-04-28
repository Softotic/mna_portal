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
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      {/* Hero Section */}
      <Box sx={{ position: 'relative', bgcolor: '#0a3712', color: '#fff', py: { xs: 8, md: 12 }, overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <Box sx={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="overline" sx={{ color: '#94d087', letterSpacing: 1.5, mb: 3, display: 'block', fontWeight: 700 }}>
                Welcome to MNA
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.1, mb: 3 }}>
                {settings?.site_name || 'MNA Portal'}
              </Typography>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 300, color: '#d7e6cf', lineHeight: 1.6 }}>
                {settings?.site_message || 'A dynamic public portal for MNA news and updates.'}
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                <Button
                  component={RouterLink}
                  to="/news"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{ textTransform: 'none', fontWeight: 700, paddingX: 4, paddingY: 1.5 }}
                >
                  Explore News
                </Button>
                <Button
                  component={RouterLink}
                  to="/complaints"
                  variant="outlined"
                  size="large"
                  sx={{ textTransform: 'none', fontWeight: 700, color: '#fff', borderColor: 'rgba(255,255,255,0.7)' }}
                >
                  Submit a Complaint
                </Button>
              </Box>
            </Grid>
            {settings?.intro_image && (
              <Grid item xs={12} md={6}>
                <CardMedia
                  component="img"
                  image={settings.intro_image}
                  alt="Intro"
                  sx={{ borderRadius: 4, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: 400, objectFit: 'cover' }}
                />
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Typography variant="overline" sx={{ color: '#0a3712', letterSpacing: 1.5, fontWeight: 700, mb: 2, display: 'block', textAlign: 'center' }}>
            Quick Access
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, mb: 6, textAlign: 'center' }}>
            Get the support you need fast
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e3f2e1', bgcolor: '#f7fcf7', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Latest News
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                  Stay informed with official news, announcements, and event updates from the office.
                </Typography>
                <Button component={RouterLink} to="/news" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  View news
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e3f2e1', bgcolor: '#f7fcf7', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  File a Complaint
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                  Report local issues, request help, and receive a tracking number for every submission.
                </Typography>
                <Button component={RouterLink} to="/complaints" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Submit now
                </Button>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 4, borderRadius: 4, border: '1px solid #e3f2e1', bgcolor: '#f7fcf7', height: '100%' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Track Progress
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                  Use your tracking number or CNIC to see the latest status of your complaint.
                </Typography>
                <Button component={RouterLink} to="/complaints" size="small" sx={{ textTransform: 'none', fontWeight: 700 }}>
                  Track request
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Featured News Section */}
      {featuredNews.length > 0 && (
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="overline" sx={{ color: '#0a3712', letterSpacing: 1.5, fontWeight: 700 }}>
              Latest Updates
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 3 }}>
              Featured News
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {featuredNews.slice(0, 3).map((news, idx) => (
              <Grid item xs={12} md={4} key={news.id}>
                <Card sx={{ borderRadius: 4, height: '100%', overflow: 'hidden', transition: 'transform 0.3s ease, boxShadow 0.3s ease', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 20px 50px rgba(15,23,42,0.1)' } }}>
                  {news.image ? (
                    <CardMedia component="img" height="240" image={news.image} alt={news.title} />
                  ) : (
                    <Box sx={{ height: 240, bgcolor: '#e8f4e0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography color="text.secondary">No image</Typography>
                    </Box>
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
                      {new Date(news.published_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, lineHeight: 1.3 }}>
                      {news.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}>
                      {news.excerpt || 'Read the full update on the news page.'}
                    </Typography>
                    <Button component={RouterLink} to="/news" size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>
                      Learn more →
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={RouterLink}
              to="/news"
              variant="outlined"
              size="large"
              endIcon={<ArrowForward />}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              View all news
            </Button>
          </Box>
        </Container>
      )}

      {/* Introduction Section */}
      {settings?.intro && (
        <Box sx={{ bgcolor: '#fff', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}>
              About Our Portal
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 900, mx: 'auto', color: '#4a4a4a', lineHeight: 1.8, fontSize: '1.05rem' }}>
              {settings.intro}
            </Typography>
          </Container>
        </Box>
      )}

      {/* Vision, Mission, Values Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, textAlign: 'center' }}>
            Our Core Values
          </Typography>
        </Box>
        <Grid container spacing={4}>
          {settings?.vision && (
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  height: '100%',
                  bgcolor: '#f9fdfb',
                  border: '1px solid #e0e7dd',
                  transition: 'transform 0.3s ease, boxShadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(10,55,18,0.08)' },
                }}
              >
                <Typography variant="overline" sx={{ color: '#0a3712', letterSpacing: 1.2, fontWeight: 700, mb: 2, display: 'block' }}>
                  Vision
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Our Future
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {settings.vision}
                </Typography>
              </Paper>
            </Grid>
          )}
          {settings?.mission && (
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  height: '100%',
                  bgcolor: '#fafbf8',
                  border: '1px solid #e0e7dd',
                  transition: 'transform 0.3s ease, boxShadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(10,55,18,0.08)' },
                }}
              >
                <Typography variant="overline" sx={{ color: '#0a3712', letterSpacing: 1.2, fontWeight: 700, mb: 2, display: 'block' }}>
                  Mission
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Our Purpose
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {settings.mission}
                </Typography>
              </Paper>
            </Grid>
          )}
          {settings?.values && (
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 4,
                  borderRadius: 4,
                  height: '100%',
                  bgcolor: '#fafbf8',
                  border: '1px solid #e0e7dd',
                  transition: 'transform 0.3s ease, boxShadow 0.3s ease',
                  '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 32px rgba(10,55,18,0.08)' },
                }}
              >
                <Typography variant="overline" sx={{ color: '#0a3712', letterSpacing: 1.2, fontWeight: 700, mb: 2, display: 'block' }}>
                  Values
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  What We Stand For
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {settings.values}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Container>

      {/* About Section */}
      {settings?.about && (
        <Box sx={{ bgcolor: '#f4f6f8', py: { xs: 6, md: 10 } }}>
          <Container maxWidth="lg">
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 4, textAlign: 'center' }}>
              About Us
            </Typography>
            <Typography variant="body1" sx={{ maxWidth: 900, mx: 'auto', color: '#4a4a4a', lineHeight: 1.85, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
              {settings.about}
            </Typography>
          </Container>
        </Box>
      )}

      {/* Footer */}
      <Box sx={{ bgcolor: '#0a3712', color: '#fff', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                {settings?.site_name || 'MNA Portal'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#d7e6cf', lineHeight: 1.8 }}>
                {settings?.site_message || 'A dynamic public portal for news and updates.'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Button component={RouterLink} to="/news" color="inherit" sx={{ textTransform: 'none', fontWeight: 600, mr: 2 }}>
                News
              </Button>
              <Button component={RouterLink} to="/" color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                Home
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: '1px solid rgba(255,255,255,0.1)', pt: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#a7b89e' }}>
              © {new Date().getFullYear()} {settings?.site_name || 'MNA'}. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
