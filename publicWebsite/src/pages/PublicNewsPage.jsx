import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, Grid, LinearProgress, TextField, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { publicNewsAPI } from '../api/index.js';

export default function PublicNewsPage() {
  const navigate = useNavigate();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const response = await publicNewsAPI.list();
        const data = response.data;
        setNewsList(Array.isArray(data) ? data : data?.results || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredNews = newsList.filter((news) => {
    const term = searchQuery.toLowerCase();
    return (
      news.title?.toLowerCase().includes(term) ||
      (news.excerpt || '').toLowerCase().includes(term)
    );
  });

  const featuredNews = filteredNews[0];
  const otherNews = filteredNews.slice(1);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8' }}>
      <Box sx={{ position: 'relative', bgcolor: '#0a3712', color: '#fff', py: { xs: 6, md: 10 }, overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: -80, right: -80, width: 240, height: 240, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
        <Box sx={{ position: 'absolute', bottom: -60, left: -60, width: 220, height: 220, bgcolor: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="overline" sx={{ color: '#94d087', letterSpacing: 1.5, mb: 2, display: 'block', fontWeight: 700 }}>
            Latest updates
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 800, lineHeight: 1.05, mb: 3, maxWidth: 760 }}>
            News from the MNA portal
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 680, color: '#d7e6cf', mb: 4, fontSize: '1rem' }}>
            Discover official news, announcements, and published updates in one elegant experience.
          </Typography>
          <TextField
            fullWidth
            placeholder="Search news by title or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Box sx={{ pr: 1, color: '#b7d5b0' }}>
                  <Search />
                </Box>
              ),
            }}
            variant="filled"
            sx={{ bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 2, input: { color: '#fff' }, '.MuiInputBase-input': { color: '#fff' } }}
          />
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        {filteredNews.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <Typography variant="h5" sx={{ mb: 2 }}>No news found</Typography>
            <Typography color="text.secondary">Try a different search term or check back later for new updates.</Typography>
          </Box>
        ) : (
          <Grid container spacing={4}>
            {featuredNews && (
              <Grid item xs={12} md={8}>
                <Card
                  onClick={() => navigate(`/news/${featuredNews.id}`)}
                  sx={{ borderRadius: 4, overflow: 'hidden', boxShadow: '0 24px 64px rgba(15, 23, 42, 0.08)', cursor: 'pointer', transition: 'transform 0.3s ease, boxShadow 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 32px 80px rgba(15, 23, 42, 0.12)' } }}
                >
                  {featuredNews.image ? (
                    <CardMedia component="img" height="420" image={featuredNews.image} alt={featuredNews.title} />
                  ) : (
                    <Box sx={{ height: 420, bgcolor: '#e8f4e0' }} />
                  )}
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="overline" sx={{ color: 'text.secondary', letterSpacing: 1.2, mb: 2, display: 'block' }}>
                      {new Date(featuredNews.published_at).toLocaleDateString()}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
                      {featuredNews.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.75 }}>
                      {featuredNews.excerpt}
                    </Typography>
                    <Button variant="contained" size="large" sx={{ textTransform: 'none', boxShadow: '0 12px 24px rgba(15, 23, 42, 0.12)' }}>
                      Read news
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} md={featuredNews ? 4 : 12}>
              <Box sx={{ display: 'grid', gap: 24 }}>
                {otherNews.slice(0, 3).map((news) => (
                  <Card
                    key={news.id}
                    onClick={() => navigate(`/news/${news.id}`)}
                    sx={{ borderRadius: 3, minHeight: 220, transition: 'transform 0.25s ease', cursor: 'pointer', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 40px rgba(15,23,42,0.08)' } }}
                  >
                    {news.image && <CardMedia component="img" height="180" image={news.image} alt={news.title} />}
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        {new Date(news.published_at).toLocaleDateString()}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                        {news.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {news.excerpt}
                      </Typography>
                      <Button size="small" sx={{ textTransform: 'none', fontWeight: 600 }}>Read more</Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Grid>

            {otherNews.length > 3 && (
              <Grid item xs={12}>
                <Grid container spacing={3}>
                  {otherNews.slice(3).map((news) => (
                    <Grid item xs={12} sm={6} key={news.id}>
                      <Card
                        onClick={() => navigate(`/news/${news.id}`)}
                        sx={{ borderRadius: 3, transition: 'transform 0.25s ease', cursor: 'pointer', '&:hover': { transform: 'translateY(-3px)', boxShadow: '0 14px 36px rgba(15,23,42,0.08)' } }}
                      >
                        {news.image && <CardMedia component="img" height="200" image={news.image} alt={news.title} />}
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                            {new Date(news.published_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                            {news.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {news.excerpt}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
