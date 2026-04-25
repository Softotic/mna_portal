import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardMedia, Container, Divider, Grid, LinearProgress, TextField, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import { publicNewsAPI } from '../api/index.js';

export default function PublicNewsPage() {
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

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f8fa' }}>
      <Box sx={{ bgcolor: '#0d3b0f', color: '#fff', py: { xs: 5, md: 7 } }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            News & Updates
          </Typography>
          <Typography variant="body1" sx={{ color: '#d9e6d8' }}>
            Browse the latest published updates for the MNA public website.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Box sx={{ pr: 1, color: '#999' }}>
                  <Search />
                </Box>
              ),
            }}
            variant="outlined"
            sx={{ bgcolor: '#fff', borderRadius: 2 }}
          />
        </Box>

        {filteredNews.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No news found.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredNews.map((news) => (
              <Grid item xs={12} md={6} key={news.id}>
                <Card sx={{ borderRadius: 3, transition: 'transform 0.25s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 16px 40px rgba(0,0,0,0.1)' } }}>
                  {news.image && <CardMedia component="img" height="220" image={news.image} alt={news.title} />}
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {news.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {news.excerpt}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(news.published_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  );
}
