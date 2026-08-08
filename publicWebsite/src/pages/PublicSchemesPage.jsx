import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Container,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  ArrowForward,
  ArrowOutward,
  Category,
  FilterAlt,
  Image,
  LocationCity,
  RestartAlt,
} from '@mui/icons-material';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { publicPortfolioAPI, resolveMediaUrl } from '../api/index.js';

const statusOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'future', label: 'Planned' },
  { value: 'past', label: 'Completed' },
];

const heroImage = '/images/public-schemes-hero.jpg';

function normalize(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function cleanDisplayText(value) {
  return String(value || '').replace(/[\u2013\u2014]/g, '-');
}

function statusLabel(status) {
  return statusOptions.find((item) => item.value === status)?.label || cleanDisplayText(status);
}

function statusColor(status) {
  if (status === 'ongoing') return 'success';
  if (status === 'future') return 'info';
  return 'default';
}

export default function PublicSchemesPage() {
  const { settings } = useOutletContext();
  const theme = useTheme();
  const desktopFilters = useMediaQuery(theme.breakpoints.up('lg'));
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [requestKey, setRequestKey] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ucs, setUcs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedUc, setSelectedUc] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    let active = true;

    (async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const [ucResponse, categoryResponse, schemeResponse] = await Promise.all([
          publicPortfolioAPI.unionCouncils({ ordering: 'sort_order' }),
          publicPortfolioAPI.categories({ ordering: 'sort_order' }),
          publicPortfolioAPI.schemes({ ordering: 'sort_order' }),
        ]);
        if (!active) return;
        setUcs(normalize(ucResponse.data));
        setCategories(normalize(categoryResponse.data));
        setSchemes(normalize(schemeResponse.data));
      } catch {
        if (active) setLoadError(true);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [requestKey]);

  const availableCategories = useMemo(
    () =>
      selectedUc
        ? categories.filter((category) => String(category.union_council) === String(selectedUc))
        : categories,
    [categories, selectedUc],
  );

  const visibleSchemes = useMemo(
    () =>
      schemes.filter((scheme) => {
        const matchesUc = !selectedUc || String(scheme.union_council) === String(selectedUc);
        const matchesCategory = !selectedCategory || String(scheme.category) === String(selectedCategory);
        const matchesStatus = selectedStatus === 'all' || scheme.status === selectedStatus;
        return matchesUc && matchesCategory && matchesStatus;
      }),
    [schemes, selectedCategory, selectedStatus, selectedUc],
  );

  const selectedUcName = ucs.find((uc) => String(uc.id) === String(selectedUc))?.name;
  const selectedCategoryName = categories.find((category) => String(category.id) === String(selectedCategory))?.name;
  const hasActiveFilters = Boolean(selectedUc || selectedCategory || selectedStatus !== 'all');

  const chooseUc = useCallback((ucId) => {
    setSelectedUc(ucId);
    setSelectedCategory(null);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedUc(null);
    setSelectedCategory(null);
    setSelectedStatus('all');
  }, []);

  const selectionSummary = [
    selectedUcName || 'All union councils',
    selectedCategoryName || 'All categories',
    statusLabel(selectedStatus),
  ].join(' / ');

  return (
    <Box>
      <Box
        component="section"
        aria-labelledby="schemes-heading"
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          background: 'linear-gradient(180deg, rgba(223,236,229,0.72) 0%, rgba(245,247,245,0.98) 100%)',
        }}
      >
        <Container sx={{ py: { xs: 5, md: 7 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 0.9fr) minmax(340px, 0.72fr)' },
              gap: { xs: 4, md: 7 },
              alignItems: 'center',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Chip
                icon={<LocationCity />}
                label={cleanDisplayText(settings?.district || 'District portfolio')}
                sx={{ bgcolor: alpha('#176044', 0.1), color: 'primary.dark', mb: 2.4 }}
              />
              <Typography
                id="schemes-heading"
                variant="h1"
                sx={{ maxWidth: 760, fontSize: { xs: '2.65rem', sm: '3.6rem', lg: '4.35rem' } }}
              >
                Development work across the district
              </Typography>
              <Typography sx={{ mt: 2.2, maxWidth: 650, color: 'text.secondary', fontSize: { xs: '1rem', md: '1.08rem' } }}>
                Explore ongoing, planned, and completed schemes by union council and public-service category.
              </Typography>
            </Box>

            <Box sx={{ position: 'relative', minWidth: 0 }}>
              <Box
                component="img"
                src={heroImage}
                alt="Public school buildings, a district road, trees, and solar lighting"
                fetchPriority="high"
                sx={{
                  display: 'block',
                  width: '100%',
                  aspectRatio: '16 / 10',
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: alpha('#176044', 0.2),
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: { xs: 12, md: 18 },
                  right: { xs: 12, md: 18 },
                  bottom: { xs: 12, md: 18 },
                  p: { xs: 1.4, md: 1.8 },
                  borderRadius: 1.5,
                  bgcolor: 'rgba(14,63,45,0.9)',
                  color: '#f8fbf9',
                }}
              >
                <Typography sx={{ fontWeight: 800 }}>A transparent public portfolio</Typography>
                <Typography variant="body2" sx={{ mt: 0.25, color: 'rgba(248,251,249,0.76)' }}>
                  Open each scheme for its full description, media, status, and supporting documents.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container sx={{ pt: { xs: 4, md: 6 }, pb: 0 }}>
        <Button
          variant="outlined"
          startIcon={<FilterAlt />}
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="scheme-filters"
          aria-label={filtersOpen ? 'Hide scheme filters' : 'Filter schemes'}
          sx={{ display: { xs: 'inline-flex', lg: 'none' }, mb: 2.5 }}
        >
          {filtersOpen ? 'Hide filters' : 'Filter schemes'}
        </Button>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: '290px minmax(0, 1fr)' },
            gap: { xs: 3.5, lg: 5 },
            alignItems: 'start',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Collapse in={filtersOpen || desktopFilters} timeout={240}>
              <FilterPanel
                ucs={ucs}
                categories={availableCategories}
                selectedUc={selectedUc}
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                chooseUc={chooseUc}
                setSelectedCategory={setSelectedCategory}
                setSelectedStatus={setSelectedStatus}
                resetFilters={resetFilters}
                hasActiveFilters={hasActiveFilters}
              />
            </Collapse>
          </Box>

          <Box component="section" aria-labelledby="scheme-results-heading" sx={{ minWidth: 0 }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'flex-end' },
                pb: 2.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box>
                <Typography id="scheme-results-heading" variant="h3" sx={{ fontSize: { xs: '1.8rem', md: '2.35rem' } }}>
                  {loading ? 'Loading schemes' : `${visibleSchemes.length} ${visibleSchemes.length === 1 ? 'scheme' : 'schemes'}`}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.65 }}>
                  {selectionSummary}
                </Typography>
              </Box>
              {hasActiveFilters && (
                <Button aria-label="Clear scheme filters" onClick={resetFilters} startIcon={<RestartAlt />} sx={{ px: 0.5 }}>
                  Clear filters
                </Button>
              )}
            </Box>

            {loadError && (
              <Alert
                severity="error"
                sx={{ mt: 3 }}
                action={<Button color="inherit" size="small" onClick={() => setRequestKey((value) => value + 1)}>Try again</Button>}
              >
                Schemes could not be loaded. Check your connection and try again.
              </Alert>
            )}

            {loading ? (
              <LoadingGrid />
            ) : !loadError && visibleSchemes.length === 0 ? (
              <EmptyResults onReset={resetFilters} />
            ) : !loadError ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
                  gap: 2.5,
                  mt: 3,
                }}
              >
                {visibleSchemes.map((scheme) => <SchemeCard key={scheme.id} scheme={scheme} />)}
              </Box>
            ) : null}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function FilterPanel({
  ucs,
  categories,
  selectedUc,
  selectedCategory,
  selectedStatus,
  chooseUc,
  setSelectedCategory,
  setSelectedStatus,
  resetFilters,
  hasActiveFilters,
}) {
  return (
    <Box
      id="scheme-filters"
      component="aside"
      aria-label="Scheme filters"
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 104 },
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2.5, bgcolor: 'primary.dark', color: 'primary.contrastText' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FilterAlt fontSize="small" />
          <Typography variant="h6" sx={{ color: 'inherit' }}>Filter schemes</Typography>
        </Stack>
        <Typography variant="body2" sx={{ mt: 0.7, color: 'rgba(248,251,249,0.72)' }}>
          Narrow the portfolio by place, service, and progress.
        </Typography>
      </Box>

      <FilterGroup title="Union council" icon={<LocationCity fontSize="small" />}>
        <FilterButton active={!selectedUc} onClick={() => chooseUc(null)}>All union councils</FilterButton>
        {ucs.map((uc) => (
          <FilterButton key={uc.id} active={String(selectedUc) === String(uc.id)} onClick={() => chooseUc(uc.id)}>
            {cleanDisplayText(uc.name)}
          </FilterButton>
        ))}
      </FilterGroup>

      <FilterGroup title="Category" icon={<Category fontSize="small" />}>
        <FilterButton active={!selectedCategory} onClick={() => setSelectedCategory(null)}>All categories</FilterButton>
        {categories.map((category) => (
          <FilterButton
            key={category.id}
            active={String(selectedCategory) === String(category.id)}
            onClick={() => setSelectedCategory(category.id)}
          >
            {cleanDisplayText(category.name)}
          </FilterButton>
        ))}
        {categories.length === 0 && <Typography variant="body2" color="text.secondary">No categories are available.</Typography>}
      </FilterGroup>

      <FilterGroup title="Progress">
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          {statusOptions.map((status) => (
            <Chip
              key={status.value}
              label={status.label}
              clickable
              color={selectedStatus === status.value ? 'primary' : 'default'}
              variant={selectedStatus === status.value ? 'filled' : 'outlined'}
              onClick={() => setSelectedStatus(status.value)}
              sx={{ minHeight: 38 }}
            />
          ))}
        </Stack>
      </FilterGroup>

      {hasActiveFilters && (
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          <Button aria-label="Reset all scheme filters" fullWidth variant="outlined" startIcon={<RestartAlt />} onClick={resetFilters}>Reset all filters</Button>
        </Box>
      )}
    </Box>
  );
}

function FilterGroup({ title, icon, children }) {
  return (
    <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" spacing={0.8} sx={{ alignItems: 'center', mb: 1.35, color: 'text.secondary' }}>
        {icon}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>{title}</Typography>
      </Stack>
      <Stack spacing={0.55}>{children}</Stack>
    </Box>
  );
}

function FilterButton({ active, onClick, children }) {
  return (
    <Button
      fullWidth
      variant={active ? 'contained' : 'text'}
      onClick={onClick}
      aria-pressed={active}
      aria-label={typeof children === 'string' ? children : undefined}
      sx={{ justifyContent: 'space-between', px: 1.5, minHeight: 42 }}
      endIcon={active ? <ArrowForward fontSize="small" /> : null}
    >
      {children}
    </Button>
  );
}

function SchemeCard({ scheme }) {
  const image = getSchemeImage(scheme);

  return (
    <Card
      className="scroll-reveal"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'transform 240ms var(--site-ease), border-color 240ms var(--site-ease)',
        '&:hover': { transform: 'translateY(-4px)', borderColor: alpha('#176044', 0.34) },
        '&:focus-within': { outline: '3px solid', outlineColor: alpha('#d69a35', 0.5), outlineOffset: 2 },
      }}
    >
      {image ? (
        <CardMedia
          component="img"
          image={image}
          alt={`${cleanDisplayText(scheme.name)} scheme`}
          loading="lazy"
          sx={{ height: 208, objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 208,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            bgcolor: 'primary.dark',
            color: 'rgba(248,251,249,0.76)',
          }}
        >
          <Image sx={{ color: 'secondary.light' }} />
          <Typography variant="body2" sx={{ fontWeight: 700 }}>Project media pending</Typography>
        </Box>
      )}

      <CardContent sx={{ p: 2.7, display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <Stack direction="row" spacing={0.8} useFlexGap sx={{ mb: 1.5, flexWrap: 'wrap' }}>
          <Chip size="small" label={statusLabel(scheme.status)} color={statusColor(scheme.status)} />
          {scheme.category_name && <Chip size="small" label={cleanDisplayText(scheme.category_name)} variant="outlined" />}
        </Stack>
        <Typography variant="h5" sx={{ overflowWrap: 'anywhere' }}>{cleanDisplayText(scheme.name)}</Typography>
        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            overflow: 'hidden',
          }}
        >
          {cleanDisplayText(scheme.description || 'Details will be published as the scheme progresses.')}
        </Typography>
        <Button
          component={RouterLink}
          to={`/schemes/${scheme.id}`}
          endIcon={<ArrowOutward />}
          sx={{ mt: 'auto', pt: 2.2, alignSelf: 'flex-start', px: 0.5 }}
        >
          View scheme
        </Button>
      </CardContent>
    </Card>
  );
}

function LoadingGrid() {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2.5, mt: 3 }}>
      {[0, 1, 2, 3].map((item) => (
        <Box key={item} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden', bgcolor: 'background.paper' }}>
          <Skeleton variant="rectangular" height={208} animation="wave" />
          <Box sx={{ p: 2.7 }}>
            <Skeleton width="42%" />
            <Skeleton width="76%" height={36} sx={{ mt: 1 }} />
            <Skeleton width="92%" />
            <Skeleton width="62%" />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

function EmptyResults({ onReset }) {
  return (
    <Box
      sx={{
        mt: 3,
        py: { xs: 6, md: 9 },
        px: 3,
        textAlign: 'center',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ width: 52, height: 52, mx: 'auto', display: 'grid', placeItems: 'center', borderRadius: 1.5, bgcolor: alpha('#176044', 0.1), color: 'primary.main' }}>
        <FilterAlt />
      </Box>
      <Typography variant="h5" sx={{ mt: 2 }}>No schemes match these filters</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 480, mx: 'auto' }}>
        Clear the current selection to return to the complete district portfolio.
      </Typography>
      <Button aria-label="Clear scheme filters" variant="contained" startIcon={<RestartAlt />} onClick={onReset} sx={{ mt: 2.5 }}>Clear filters</Button>
    </Box>
  );
}

function getSchemeImage(scheme) {
  return resolveMediaUrl(scheme.image || scheme.images?.[0]?.image || '');
}
