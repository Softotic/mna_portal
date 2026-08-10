import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowOutward, Article, Close, ExpandMore, Search } from '@mui/icons-material';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { publicNewsAPI, resolveMediaUrl } from '../api/index.js';

const PAGE_SIZE = 6;

function cleanNewsText(value) {
  return String(value || '').replace(/[\u2013\u2014]/g, '-');
}

function summarizeNews(item) {
  const source = item?.excerpt || item?.content || '';
  const text = cleanNewsText(source).replace(/\s+/g, ' ').trim();
  if (!text) return 'Open the article to read the complete update.';
  if (text.length <= 190) return text;
  return `${text.slice(0, 187).trimEnd()}...`;
}

function formatNewsDate(value) {
  if (!value) return 'Official update';
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function getNewsImage(item) {
  return resolveMediaUrl(item.image || item.images?.[0]?.image || '');
}

export default function PublicNewsPage() {
  const { settings } = useOutletContext();
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      } catch {
        if (active) {
          setError('We could not load newsroom updates. Check your connection and try again.');
        }
      } finally {
        if (active) setLoading(false);
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
      const title = cleanNewsText(item.title).toLowerCase();
      const summary = cleanNewsText(item.excerpt || item.content).toLowerCase();
      return title.includes(term) || summary.includes(term);
    });
  }, [newsList, searchQuery]);

  const leadStory = filteredNews[0] || null;
  const archiveStories = filteredNews.slice(1);
  const visibleArchiveStories = archiveStories.slice(0, archiveVisibleCount);
  const hasMoreArchiveStories = archiveVisibleCount < archiveStories.length;
  const resultLabel = searchQuery.trim()
    ? `${filteredNews.length} ${filteredNews.length === 1 ? 'result' : 'results'} for "${searchQuery.trim()}"`
    : `${filteredNews.length} published ${filteredNews.length === 1 ? 'update' : 'updates'}`;

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setArchiveVisibleCount(PAGE_SIZE);
  };

  if (loading) return <NewsPageSkeleton />;

  return (
    <Box sx={{ pb: { xs: 6, md: 9 } }}>
      <Box
        component="section"
        sx={{
          py: { xs: 4, md: 6 },
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035),
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.3fr) minmax(340px, 0.7fr)' },
              gap: { xs: 3.5, md: 6 },
              alignItems: 'end',
            }}
          >
            <Box>
              <Typography variant="overline" color="primary.main">
                Official newsroom
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  mt: 1.2,
                  maxWidth: 760,
                  fontSize: { xs: '2.45rem', sm: '3.1rem', md: '3.65rem' },
                  lineHeight: 1.04,
                }}
              >
                News and updates from the constituency office.
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 2.2, maxWidth: 650, fontSize: { md: '1.05rem' } }}>
                Official statements, field activity, and public service updates from {settings?.site_name || 'the MNA office'}.
              </Typography>
            </Box>

            <TextField
              fullWidth
              type="search"
              label="Search newsroom"
              placeholder="Headline or topic"
              value={searchQuery}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton aria-label="Clear newsroom search" onClick={() => setSearchQuery('')} edge="end">
                        <Close fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
          </Box>
        </Container>
      </Box>

      <Container sx={{ pt: { xs: 4, md: 6 } }}>
        {error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredNews.length === 0 ? (
          <EmptyNewsState searchQuery={searchQuery} onClear={() => setSearchQuery('')} />
        ) : (
          <>
            <Box component="section" aria-labelledby="news-results-heading">
              <Typography id="news-results-heading" variant="h3" sx={{ fontSize: { xs: '2rem', md: '2.35rem' } }}>
                {searchQuery.trim() ? 'Search results' : 'Latest update'}
              </Typography>
              <Typography role="status" aria-live="polite" color="text.secondary" sx={{ mt: 0.8, mb: 3 }}>
                {resultLabel}
              </Typography>

              <LeadStoryCard item={leadStory} />
            </Box>

            {visibleArchiveStories.length > 0 && (
              <Box component="section" aria-labelledby="news-archive-heading" sx={{ mt: { xs: 5, md: 7 } }}>
                <Typography id="news-archive-heading" variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.1rem' }, mb: 3 }}>
                  More updates
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                    gap: 3,
                  }}
                >
                  {visibleArchiveStories.map((item) => (
                    <ArchiveStoryCard key={item.id} item={item} />
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
          </>
        )}
      </Container>
    </Box>
  );
}

function LeadStoryCard({ item }) {
  const image = getNewsImage(item);
  const title = cleanNewsText(item.title);

  return (
    <Card
      component={RouterLink}
      to={`/news/${item.id}`}
      aria-label={`Read article: ${title}`}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'minmax(280px, 0.82fr) minmax(0, 1.18fr)' },
        overflow: 'hidden',
        color: 'text.primary',
        transition: 'border-color 200ms var(--site-ease), transform 200ms var(--site-ease)',
        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
        '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main', outlineOffset: 3 },
      }}
    >
      {image ? (
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{ width: '100%', height: { xs: 240, md: '100%' }, minHeight: { md: 380 }, objectFit: 'cover' }}
        />
      ) : (
        <NewsImagePlaceholder item={item} minHeight={{ xs: 220, md: 380 }} />
      )}

      <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Stack direction="row" spacing={2} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 800 }}>
            {formatNewsDate(item.published_at)}
          </Typography>
          <Typography variant="body2" color="text.secondary">Official article</Typography>
        </Stack>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.55rem', md: '1.9rem' },
            lineHeight: 1.22,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            mt: 2,
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {summarizeNews(item)}
        </Typography>
        <Typography sx={{ mt: 3, color: 'primary.main', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 0.7 }}>
          Read article <ArrowOutward sx={{ fontSize: 18 }} />
        </Typography>
      </CardContent>
    </Card>
  );
}

function ArchiveStoryCard({ item }) {
  const image = getNewsImage(item);
  const title = cleanNewsText(item.title);

  return (
    <Card
      component={RouterLink}
      to={`/news/${item.id}`}
      aria-label={`Read article: ${title}`}
      sx={{
        height: '100%',
        overflow: 'hidden',
        color: 'text.primary',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 200ms var(--site-ease), transform 200ms var(--site-ease)',
        '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
        '&:focus-visible': { outline: '3px solid', outlineColor: 'secondary.main', outlineOffset: 3 },
      }}
    >
      {image ? (
        <CardMedia component="img" image={image} alt={title} sx={{ height: 220, objectFit: 'cover' }} />
      ) : (
        <NewsImagePlaceholder item={item} minHeight={210} compact />
      )}
      <CardContent sx={{ p: 3.25, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 800 }}>
          {formatNewsDate(item.published_at)}
        </Typography>
        <Typography
          variant="h6"
          sx={{
            mt: 1.2,
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </Typography>
        <Typography
          color="text.secondary"
          variant="body2"
          sx={{
            mt: 1.3,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {summarizeNews(item)}
        </Typography>
        <Typography sx={{ mt: 'auto', pt: 2.5, color: 'primary.main', fontWeight: 800 }}>
          Read article <ArrowOutward sx={{ fontSize: 17, verticalAlign: 'middle', ml: 0.4 }} />
        </Typography>
      </CardContent>
    </Card>
  );
}

function NewsImagePlaceholder({ item, minHeight, compact = false }) {
  return (
    <Box
      aria-hidden="true"
      sx={{
        minHeight,
        p: compact ? 2.5 : { xs: 3, md: 4 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        bgcolor: 'primary.dark',
        color: 'primary.contrastText',
      }}
    >
      <Box
        sx={{
          width: compact ? 42 : 54,
          height: compact ? 42 : 54,
          borderRadius: 2.5,
          display: 'grid',
          placeItems: 'center',
          bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.18),
          color: 'secondary.light',
        }}
      >
        <Article fontSize={compact ? 'small' : 'medium'} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 800 }}>Official update</Typography>
        <Typography variant="body2" sx={{ mt: 0.4, color: 'rgba(248,251,249,0.78)' }}>
          {formatNewsDate(item.published_at)}
        </Typography>
      </Box>
    </Box>
  );
}

function EmptyNewsState({ searchQuery, onClear }) {
  const hasSearch = Boolean(searchQuery.trim());

  return (
    <Paper sx={{ p: { xs: 3.5, md: 5 }, border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
      <Search sx={{ fontSize: 34, color: 'primary.main', mb: 1.5 }} />
      <Typography variant="h5" sx={{ mb: 1 }}>
        {hasSearch ? 'No matching updates' : 'No updates published yet'}
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 520, mx: 'auto' }}>
        {hasSearch
          ? 'Try a broader keyword or clear the search to view all published updates.'
          : 'Official news and public service updates will appear here when they are published.'}
      </Typography>
      {hasSearch && (
        <Button variant="outlined" onClick={onClear} sx={{ mt: 2.5 }}>
          Clear search
        </Button>
      )}
    </Paper>
  );
}

function NewsPageSkeleton() {
  return (
    <Box sx={{ pb: 8 }}>
      <Box sx={{ py: { xs: 4, md: 6 }, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.035) }}>
        <Container>
          <Skeleton variant="text" width={150} height={24} />
          <Skeleton variant="text" width="min(720px, 90%)" height={72} sx={{ mt: 1 }} />
          <Skeleton variant="text" width="min(560px, 80%)" height={30} sx={{ mt: 1.5 }} />
        </Container>
      </Box>
      <Container sx={{ pt: { xs: 4, md: 6 } }}>
        <Skeleton variant="text" width={220} height={48} />
        <Skeleton variant="text" width={130} height={24} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={380} />
      </Container>
    </Box>
  );
}
