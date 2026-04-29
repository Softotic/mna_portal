import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowOutward, Article, ExpandMore, Search } from '@mui/icons-material';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { publicNewsAPI } from '../api/index.js';

export default function PublicNewsPage() {
  const PAGE_SIZE = 3;
  const navigate = useNavigate();
  const { settings } = useOutletContext();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [archiveVisibleCount, setArchiveVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await publicNewsAPI.list();
        if (!active) return;
        const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
        setNewsList(data);
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

  const filteredNews = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return newsList;
    return newsList.filter((item) => {
      return item.title?.toLowerCase().includes(term) || (item.excerpt || '').toLowerCase().includes(term);
    });
  }, [newsList, searchQuery]);

  const leadStory = filteredNews[0];
  const supportingStories = filteredNews.slice(1, 3);
  const archiveStories = filteredNews.slice(3);
  const visibleArchiveStories = archiveStories.slice(0, archiveVisibleCount);
  const hasMoreArchiveStories = archiveVisibleCount < archiveStories.length;

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setArchiveVisibleCount(PAGE_SIZE);
  };

  if (loading) {
    return <LinearProgress color="secondary" />;
  }

  return (
    <Box sx={{ pb: { xs: 6, md: 9 }, px: { xs: 3, md: 6 } }}>
      <Container sx={{ pt: { xs: 5, md: 8 }, pb: { xs: 4, md: 5 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) minmax(320px, 420px)' },
            gap: { xs: 3, md: 5 },
            alignItems: 'end',
          }}
        >
          <Box>
            <Typography variant="overline" color="secondary.main">
              Official Newsroom
            </Typography>
            <Typography variant="h2" sx={{ mt: 1.2, maxWidth: 800 }}>
              A professional record of public statements, field work, and office activity
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 2.5, maxWidth: 760 }}>
              {settings?.site_name || 'This office'} uses the newsroom to publish official updates in a clear editorial format that is easy for citizens, media, and stakeholders to browse.
            </Typography>
          </Box>
          <Box>
            <TextField
              fullWidth
              placeholder="Search headlines or summaries"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Box>
      </Container>

      <Container>
        {filteredNews.length === 0 ? (
          <Paper sx={{ p: 4, border: '1px solid rgba(16,36,27,0.08)', textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No matching updates found
            </Typography>
            <Typography color="text.secondary">
              Try a different keyword or return later as new stories are published.
            </Typography>
          </Paper>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 2fr) minmax(300px, 1fr)' },
              gap: { xs: 3, md: 4 },
              alignItems: 'start',
            }}
          >
            {leadStory && (
              <Box>
                <Card sx={{ cursor: 'pointer', overflow: 'hidden' }} onClick={() => navigate(`/news/${leadStory.id}`)}>
                  {leadStory.image ? (
                    <CardMedia component="img" image={leadStory.image} alt={leadStory.title} sx={{ height: { xs: 260, md: 470 }, objectFit: 'cover' }} />
                  ) : (
                    <NewsImagePlaceholder height={{ xs: 260, md: 470 }} title={leadStory.title} />
                  )}
                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Typography variant="overline" color="secondary.main">
                      {leadStory.published_at ? new Date(leadStory.published_at).toLocaleDateString() : 'Lead story'}
                    </Typography>
                    <Typography variant="h3" sx={{ mt: 1.2, mb: 1.6, maxWidth: 820 }}>
                      {leadStory.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ maxWidth: 760 }}>
                      {leadStory.excerpt || 'Open the story to read the complete official update.'}
                    </Typography>
                    <Typography sx={{ mt: 2.5, color: 'primary.main', fontWeight: 800 }}>
                      Read article <ArrowOutward sx={{ fontSize: 18, verticalAlign: 'middle', ml: 0.5 }} />
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            <Box>
              <StackedPaperList items={supportingStories} navigate={navigate} />
            </Box>

            {visibleArchiveStories.length > 0 && (
              <Box sx={{ gridColumn: '1 / -1', mt: { xs: 2, md: 4 } }}>
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="overline" color="secondary.main">
                    More Updates
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 0.8 }}>
                    More published updates
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                    gap: 3,
                  }}
                >
                  {visibleArchiveStories.map((item) => (
                    <Box key={item.id}>
                      <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate(`/news/${item.id}`)}>
                        {item.image ? (
                          <CardMedia component="img" image={item.image} alt={item.title} sx={{ height: 220, objectFit: 'cover' }} />
                        ) : (
                          <NewsImagePlaceholder height={220} title={item.title} compact />
                        )}
                        <CardContent sx={{ p: 3 }}>
                          <Typography variant="overline" color="secondary.main">
                            {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Official update'}
                          </Typography>
                          <Typography variant="h6" sx={{ mt: 1, mb: 1.2 }}>
                            {item.title}
                          </Typography>
                          <Typography color="text.secondary">
                            {item.excerpt || 'Open the article to continue reading.'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ))}
                </Box>
                {hasMoreArchiveStories && (
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      endIcon={<ExpandMore />}
                      onClick={() => setArchiveVisibleCount((count) => count + PAGE_SIZE)}
                    >
                      Load more updates
                    </Button>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        )}
      </Container>
    </Box>
  );
}

function NewsImagePlaceholder({ height, title, compact = false }) {
  return (
    <Box
      sx={{
        height,
        p: compact ? 2.5 : { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        color: 'primary.main',
        background:
          'linear-gradient(135deg, rgba(220,235,220,0.88) 0%, rgba(255,253,248,0.96) 58%, rgba(180,138,67,0.18) 100%)',
      }}
    >
      <Box
        sx={{
          width: compact ? 42 : 54,
          height: compact ? 42 : 54,
          borderRadius: '50%',
          display: 'grid',
          placeItems: 'center',
          bgcolor: alpha('#1f5f46', 0.10),
          color: 'primary.main',
        }}
      >
        <Article fontSize={compact ? 'small' : 'medium'} />
      </Box>
      <Box>
        <Typography variant="overline" color="secondary.main">
          Official update
        </Typography>
        {!compact && (
          <Typography variant="h5" sx={{ mt: 1, maxWidth: 520 }}>
            {title}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

function StackedPaperList({ items, navigate }) {
  if (!items.length) {
    return null;
  }

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {items.map((item) => (
        <Paper
          key={item.id}
          sx={{ p: 2.6, border: '1px solid rgba(16,36,27,0.08)', cursor: 'pointer' }}
          onClick={() => navigate(`/news/${item.id}`)}
        >
          <Typography variant="overline" color="secondary.main">
            {item.published_at ? new Date(item.published_at).toLocaleDateString() : 'Published'}
          </Typography>
          <Typography variant="h6" sx={{ mt: 0.9, mb: 1.1 }}>
            {item.title}
          </Typography>
          <Typography color="text.secondary">
            {item.excerpt || 'Open the article to read the complete update.'}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}
