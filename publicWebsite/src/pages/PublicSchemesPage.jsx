import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowOutward, Category, Image, LocationCity } from '@mui/icons-material';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { publicPortfolioAPI, resolveMediaUrl } from '../api/index.js';

const statuses = ['all', 'ongoing', 'future', 'past'];

function normalize(data) {
  return Array.isArray(data) ? data : data?.results || [];
}

function statusColor(status) {
  if (status === 'ongoing') return 'success';
  if (status === 'future') return 'info';
  return 'default';
}

export default function PublicSchemesPage() {
  const { settings } = useOutletContext();
  const [loading, setLoading] = useState(true);
  const [ucs, setUcs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [selectedUc, setSelectedUc] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [ucResponse, categoryResponse, schemeResponse] = await Promise.all([
          publicPortfolioAPI.unionCouncils({ ordering: 'sort_order' }),
          publicPortfolioAPI.categories({ ordering: 'sort_order' }),
          publicPortfolioAPI.schemes({ ordering: 'sort_order' }),
        ]);
        if (!active) return;
        const ucData = normalize(ucResponse.data);
        const categoryData = normalize(categoryResponse.data);
        setUcs(ucData);
        setCategories(categoryData);
        setSchemes(normalize(schemeResponse.data));
        setSelectedUc(ucData[0]?.id || null);
        setSelectedCategory(categoryData.find((category) => category.union_council === ucData[0]?.id)?.id || null);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const ucCategories = useMemo(
    () => categories.filter((category) => String(category.union_council) === String(selectedUc)),
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

  const chooseUc = (ucId) => {
    setSelectedUc(ucId);
    setSelectedCategory(categories.find((category) => String(category.union_council) === String(ucId))?.id || null);
  };

  if (loading) return <LinearProgress color="secondary" />;

  return (
    <Box sx={{ pb: { xs: 6, md: 9 } }}>
      <Box sx={{ borderBottom: '1px solid rgba(16,36,27,0.08)', background: 'linear-gradient(180deg, rgba(220,235,220,0.68) 0%, rgba(255,253,248,0.98) 100%)' }}>
        <Container sx={{ py: { xs: 5, md: 8 }, px: { xs: 3, md: 8 } }}>
          <Chip icon={<LocationCity />} label={settings?.district || 'District portfolio'} sx={{ bgcolor: alpha('#1f5f46', 0.10), color: 'primary.main', mb: 2.5 }} />
          <Typography variant="h1" sx={{ maxWidth: 960, fontSize: { xs: '2.4rem', md: '4.7rem' }, lineHeight: 1.04 }}>
            Public schemes by union council and category
          </Typography>
          <Typography sx={{ mt: 2.5, maxWidth: 760, color: 'text.secondary', fontSize: '1.06rem' }}>
            Browse ongoing, future, and completed public work across the district in one transparent portfolio.
          </Typography>
        </Container>
      </Box>

      <Container sx={{ py: { xs: 4, md: 6 }, px: { xs: 3, md: 8 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '260px 240px minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
          <SidePanel title="Union Councils" icon={<LocationCity fontSize="small" />}>
            {ucs.map((uc) => (
              <Button key={uc.id} fullWidth variant={selectedUc === uc.id ? 'contained' : 'text'} onClick={() => chooseUc(uc.id)} sx={{ justifyContent: 'flex-start' }}>
                {uc.name}
              </Button>
            ))}
          </SidePanel>

          <SidePanel title="Categories" icon={<Category fontSize="small" />}>
            {ucCategories.map((category) => (
              <Button key={category.id} fullWidth variant={selectedCategory === category.id ? 'contained' : 'text'} onClick={() => setSelectedCategory(category.id)} sx={{ justifyContent: 'flex-start' }}>
                {category.name}
              </Button>
            ))}
            {ucCategories.length === 0 && <Typography color="text.secondary">No categories yet.</Typography>}
          </SidePanel>

          <Box>
            <Paper sx={{ p: 2.2, mb: 3, border: '1px solid rgba(16,36,27,0.08)' }}>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {statuses.map((status) => (
                  <Chip
                    key={status}
                    label={status === 'all' ? 'All' : status}
                    clickable
                    color={selectedStatus === status ? 'primary' : 'default'}
                    variant={selectedStatus === status ? 'filled' : 'outlined'}
                    onClick={() => setSelectedStatus(status)}
                    sx={{ textTransform: 'capitalize' }}
                  />
                ))}
              </Stack>
            </Paper>

            {visibleSchemes.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center', border: '1px solid rgba(16,36,27,0.08)' }}>
                <Typography variant="h6">No schemes found</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>Select another union council, category, or status.</Typography>
              </Paper>
            ) : (
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 3 }}>
                {visibleSchemes.map((scheme) => (
                  <Card key={scheme.id} sx={{ height: '100%', overflow: 'hidden', border: '1px solid rgba(16,36,27,0.08)' }}>
                    {getSchemeImage(scheme) ? (
                      <CardMedia component="img" image={getSchemeImage(scheme)} alt={scheme.name} sx={{ height: 220, objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ height: 220, display: 'grid', placeItems: 'center', bgcolor: alpha('#1f5f46', 0.08), color: 'primary.main' }}>
                        <Image />
                      </Box>
                    )}
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap' }} useFlexGap>
                        <Chip size="small" label={scheme.status} color={statusColor(scheme.status)} sx={{ textTransform: 'capitalize' }} />
                        <Chip size="small" label={scheme.category_name} variant="outlined" />
                      </Stack>
                      <Typography variant="h5" sx={{ mb: 1 }}>{scheme.name}</Typography>
                      <Typography color="text.secondary">{scheme.description || 'Details will be updated soon.'}</Typography>
                      <Button component={RouterLink} to={`/schemes/${scheme.id}`} endIcon={<ArrowOutward />} sx={{ mt: 2 }}>
                        Open scheme
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function getSchemeImage(scheme) {
  return resolveMediaUrl(scheme.image || scheme.images?.[0]?.image || '');
}

function SidePanel({ title, icon, children }) {
  return (
    <Paper sx={{ p: 2, border: '1px solid rgba(16,36,27,0.08)', position: { lg: 'sticky' }, top: { lg: 110 } }}>
      <Typography variant="overline" color="secondary.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.2 }}>
        {icon}
        {title}
      </Typography>
      <Stack spacing={0.8}>{children}</Stack>
    </Paper>
  );
}
