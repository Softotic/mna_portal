import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ArrowBack, AttachFile, ChevronLeft, ChevronRight, Image } from '@mui/icons-material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import { publicPortfolioAPI, resolveMediaUrl } from '../api/index.js';

function statusColor(status) {
  if (status === 'ongoing') return 'success'; ///// green
  if (status === 'future') return 'info';
  return 'default';
}

export default function PublicSchemeDetailPage() {
  const { id } = useParams();
  const [scheme, setScheme] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await publicPortfolioAPI.scheme(id);
        if (active) setScheme(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <LinearProgress color="secondary" />;
  if (!scheme) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5">Scheme not found.</Typography>
        <Button component={RouterLink} to="/schemes" sx={{ mt: 2 }}>Back to schemes</Button>
      </Container>
    );
  }

  const gallery = [
    ...(scheme.image ? [{ id: 'primary', image: resolveMediaUrl(scheme.image) }] : []),
    ...(scheme.images || []),
  ];

  return (
    <Box sx={{ pb: 8 }}>
      <Container sx={{ py: { xs: 5, md: 8 }, px: { xs: 3, md: 8 } }}>
        <Button component={RouterLink} to="/schemes" startIcon={<ArrowBack />} sx={{ mb: 3 }}>
          Back to schemes
        </Button>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' }, gap: 4, alignItems: 'start' }}>
          <Box>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', mb: 2 }}>
              <Chip label={scheme.status} color={statusColor(scheme.status)} sx={{ textTransform: 'capitalize' }} />
              <Chip label={scheme.union_council_name} variant="outlined" />
              <Chip label={scheme.category_name} variant="outlined" />
            </Stack>
            <Typography variant="h1" sx={{ fontSize: { xs: '2.35rem', md: '4rem' }, lineHeight: 1.05, mb: 3 }}>
              {scheme.name}
            </Typography>
            {gallery.length > 0 ? (
              <ImageGallery
                images={gallery}
                title={scheme.name}
                activeImage={activeImage}
                setActiveImage={setActiveImage}
              />
            ) : (
              <Box sx={{ height: 360, display: 'grid', placeItems: 'center', bgcolor: alpha('#1f5f46', 0.08), color: 'primary.main', borderRadius: 3, mb: 4 }}>
                <Image />
              </Box>
            )}
            <Typography color="text.secondary" sx={{ whiteSpace: 'pre-wrap', fontSize: '1.05rem', lineHeight: 1.9 }}>
              {scheme.description || 'Details for this scheme will be updated soon.'}
            </Typography>
          </Box>

          <Paper sx={{ p: 3, border: '1px solid rgba(16,36,27,0.08)', position: { lg: 'sticky' }, top: { lg: 110 } }}>
            <Typography variant="overline" color="secondary.main">Scheme Information</Typography>
            <Info label="Union Council" value={scheme.union_council_name} />
            <Info label="Category" value={scheme.category_name} />
            <Info label="Status" value={scheme.status} />
            {scheme.tag_list?.length > 0 && (
              <Box sx={{ mt: 2.2 }}>
                <Typography variant="body2" sx={{ fontWeight: 800, mb: 1 }}>Tags</Typography>
                <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                  {scheme.tag_list.map((tag) => <Chip key={tag} size="small" label={tag} />)}
                </Stack>
              </Box>
            )}
            {scheme.notes && <Info label="Notes" value={scheme.notes} multiline />}
            {scheme.attachment && (
              <Button component="a" href={resolveMediaUrl(scheme.attachment)} target="_blank" rel="noreferrer" variant="contained" startIcon={<AttachFile />} fullWidth sx={{ mt: 3 }}>
                View Attachment
              </Button>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
}

function Info({ label, value, multiline = false }) {
  return (
    <Box sx={{ mt: 2.2 }}>
      <Typography variant="body2" sx={{ fontWeight: 800 }}>{label}</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.4, textTransform: label === 'Status' ? 'capitalize' : 'none', whiteSpace: multiline ? 'pre-wrap' : 'normal' }}>
        {value || 'N/A'}
      </Typography>
    </Box>
  );
}

function ImageGallery({ images, title, activeImage, setActiveImage }) {
  const hasSlideshow = images.length > 1;
  const current = images[activeImage] || images[0];

  const move = (direction) => {
    setActiveImage((index) => (index + direction + images.length) % images.length);
  };

  return (
    <Box sx={{ position: 'relative', mb: 4 }}>
      <Box
        component="img"
        src={resolveMediaUrl(current.image)}
        alt={title}
        sx={{ width: '100%', maxHeight: 560, objectFit: 'cover', borderRadius: 3, display: 'block' }}
      />
      {hasSlideshow && (
        <>
          <IconButton
            aria-label="Previous image"
            onClick={() => move(-1)}
            sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.88)' }}
          >
            <ChevronLeft />
          </IconButton>
          <IconButton
            aria-label="Next image"
            onClick={() => move(1)}
            sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', bgcolor: 'rgba(255,255,255,0.88)' }}
          >
            <ChevronRight />
          </IconButton>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'center', mt: 1.5 }}>
            {images.map((image, index) => (
              <Box
                key={image.id || image.image}
                component="button"
                aria-label={`Show image ${index + 1}`}
                onClick={() => setActiveImage(index)}
                sx={{
                  width: index === activeImage ? 26 : 9,
                  height: 9,
                  borderRadius: 999,
                  border: 0,
                  bgcolor: index === activeImage ? 'primary.main' : 'rgba(31,95,70,0.22)',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
