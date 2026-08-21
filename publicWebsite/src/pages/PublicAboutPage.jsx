import { useMemo, useState } from 'react';
import {
  Box,
  Button,
  CardMedia,
  Container,
  Stack,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  ArrowForward,
  ArrowOutward,
  FlagOutlined,
  VerifiedOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Link as RouterLink, useOutletContext } from 'react-router-dom';
import { resolveMediaUrl } from '../api/index.js';

const portraitFallback = '/images/civic-office-hero.jpg';

function cleanDisplayText(value = '') {
  return String(value).replace(/[\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim();
}

function cleanLeaderName(value) {
  return cleanDisplayText(value).replace(/^about\s+/i, '').trim();
}

function toList(value, fallback) {
  const list = value
    ?.split(/\n+/)
    .map((item) => cleanDisplayText(item))
    .filter(Boolean);
  return list?.length ? list : fallback;
}

function organizePrinciples(items) {
  const principles = [];

  for (let index = 0; index < items.length && principles.length < 4; index += 1) {
    const current = cleanDisplayText(items[index]);
    const next = cleanDisplayText(items[index + 1]);
    const currentIsTitle = current.split(/\s+/).length <= 5 && next.split(/\s+/).length >= 5;

    principles.push({
      title: currentIsTitle ? current : `Principle ${principles.length + 1}`,
      description: currentIsTitle ? next : current,
    });
    if (currentIsTitle) index += 1;
  }

  return principles;
}

export default function PublicAboutPage() {
  const { settings } = useOutletContext();
  const [briefView, setBriefView] = useState('priorities');

  const leaderName = cleanLeaderName(settings?.leader_name || settings?.site_name || 'Member of the National Assembly');
  const designation = cleanDisplayText(settings?.designation || 'Member of the National Assembly of Pakistan');
  const about = cleanDisplayText(
    settings?.about || settings?.intro ||
      'This office helps citizens reach their elected representative, understand ongoing public work, and receive responses through structured service channels.',
  );
  const portraitSource = settings?.about_image || settings?.intro_image;
  const portrait = portraitSource ? resolveMediaUrl(portraitSource) : portraitFallback;

  const achievements = useMemo(
    () => toList(settings?.achievements, [
      'Accessible constituency support',
      'Transparent complaint tracking',
      'Clear public communication',
    ]),
    [settings],
  );
  const missionPoints = useMemo(
    () => toList(settings?.mission, [
      'Make constituency support easier to access through clear public service channels.',
      'Improve access to development work, office communication, and local representation.',
    ]),
    [settings],
  );
  const visionPoints = useMemo(
    () => toList(settings?.vision, [
      'Build a public office grounded in access, accountability, and citizen trust.',
      'Support long-term local development through responsible representation.',
    ]),
    [settings],
  );
  const principles = useMemo(
    () => organizePrinciples(toList(settings?.values, [
      'Service to the people',
      'Public decisions should begin with the needs and dignity of citizens.',
      'Transparency and accountability',
      'Public work should remain understandable, traceable, and open to scrutiny.',
      'Local representation',
      'Constituency concerns deserve a clear route to the elected office.',
    ])),
    [settings],
  );

  const tabs = [
    { id: 'priorities', label: 'Priorities' },
    { id: 'principles', label: 'Principles' },
  ];

  return (
    <Box sx={{ pb: { xs: 5, md: 8 } }}>
      <Box component="section" aria-labelledby="about-heading" sx={{ bgcolor: 'primary.dark', color: '#f6faf7', overflow: 'hidden' }}>
        <Container sx={{ py: { xs: 6, md: 9 } }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(320px, 0.75fr)' }, gap: { xs: 5, md: 8 }, alignItems: 'center' }}>
            <Box className="scroll-reveal">
              <Typography sx={{ color: 'secondary.light', fontWeight: 800, mb: 2 }}>About {leaderName}</Typography>
              <Typography id="about-heading" variant="h1" sx={{ color: 'inherit', fontSize: { xs: '2.65rem', sm: '3.65rem', md: '4.7rem' }, maxWidth: 780 }}>
                Representation built around access.
              </Typography>
              <Typography sx={{ mt: 2.5, color: 'rgba(246,250,247,0.74)', fontSize: { xs: '1.03rem', md: '1.14rem' }, maxWidth: 690 }}>
                {designation}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 4, alignItems: { xs: 'stretch', sm: 'center' } }}>
                <Button component={RouterLink} to="/complaints" variant="contained" color="secondary" endIcon={<ArrowOutward />}>
                  Contact the office
                </Button>
                <Button component={RouterLink} to="/team" sx={{ color: 'inherit', borderColor: 'rgba(255,255,255,0.34)' }} variant="outlined" endIcon={<ArrowForward />}>
                  Meet the team
                </Button>
              </Stack>
            </Box>

            <Box className="scroll-reveal" sx={{ position: 'relative', justifySelf: { md: 'end' }, width: '100%', maxWidth: 480 }}>
              <Box sx={{ position: 'absolute', width: 92, height: 92, right: -22, top: -22, borderRadius: '50%', bgcolor: 'secondary.main' }} />
              <CardMedia
                component="img"
                src={portrait}
                alt={portraitSource ? `Portrait of ${leaderName}` : 'Constituency public office'}
                sx={{ position: 'relative', width: '100%', aspectRatio: '4 / 5', maxHeight: 570, objectFit: 'cover', objectPosition: portraitSource ? 'center 20%' : 'center', borderRadius: 2 }}
              />
              <Box sx={{ position: 'absolute', left: { xs: 16, sm: -30 }, bottom: { xs: 16, sm: 28 }, maxWidth: 280, bgcolor: 'background.paper', color: 'text.primary', p: 2.5, borderRadius: 1.5, boxShadow: '0 8px 0 rgba(214,154,53,0.82)' }}>
                <Typography sx={{ fontWeight: 800 }}>{leaderName}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>{designation}</Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container component="section" aria-labelledby="service-heading" sx={{ py: { xs: 7, md: 11 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 0.55fr) minmax(0, 1.1fr)' }, gap: { xs: 3, md: 8 }, alignItems: 'start' }}>
          <Box sx={{ position: { lg: 'sticky' }, top: { lg: 128 } }}>
            <Typography id="service-heading" variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.25rem' }, maxWidth: 500 }}>A record of public service</Typography>
            <Box sx={{ width: 64, height: 4, bgcolor: 'secondary.main', mt: 3 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: { xs: '1.08rem', md: '1.26rem' }, lineHeight: 1.75, maxWidth: 800, color: 'text.secondary' }}>{about}</Typography>
            {settings?.constituency && (
              <Typography sx={{ mt: 3, fontWeight: 800, color: 'primary.main' }}>Serving {cleanDisplayText(settings.constituency)}</Typography>
            )}
          </Box>
        </Box>
      </Container>

      <Box component="section" aria-labelledby="mandate-heading" sx={{ bgcolor: alpha('#176044', 0.055), borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Container sx={{ py: { xs: 7, md: 10 } }}>
          <Typography id="mandate-heading" variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.25rem' }, mb: { xs: 4, md: 6 } }}>Purpose and direction</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, borderTop: '4px solid', borderColor: 'secondary.main', bgcolor: 'primary.dark', color: 'primary.contrastText', borderRadius: 2, overflow: 'hidden' }}>
            {[
              { title: 'Mission', icon: FlagOutlined, points: missionPoints },
              { title: 'Vision', icon: VisibilityOutlined, points: visionPoints },
            ].map(({ title, icon: Icon, points }, index) => (
              <Box key={title} sx={{ p: { xs: 3.5, md: 5 }, borderTop: { xs: index ? '1px solid rgba(255,255,255,0.14)' : 0, md: 0 }, borderLeft: { md: index ? '1px solid rgba(255,255,255,0.14)' : 0 } }}>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mb: 3 }}>
                  <Box sx={{ width: 44, height: 44, display: 'grid', placeItems: 'center', borderRadius: 1.25, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}><Icon fontSize="small" /></Box>
                  <Typography variant="h3" sx={{ color: 'inherit', fontSize: { xs: '1.8rem', md: '2.2rem' } }}>{title}</Typography>
                </Stack>
                <Stack spacing={1.6}>
                  {points.map((point) => <Typography key={point} sx={{ color: 'rgba(248,251,249,0.78)', lineHeight: 1.7 }}>{point}</Typography>)}
                </Stack>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      <Container component="section" aria-labelledby="commitments-heading" sx={{ py: { xs: 7, md: 11 } }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(280px, 0.5fr) minmax(0, 1.15fr)' }, gap: { xs: 4, md: 8 } }}>
          <Box>
            <Typography id="commitments-heading" variant="h2" sx={{ fontSize: { xs: '2.2rem', md: '3.25rem' } }}>Office commitments</Typography>
            <Typography color="text.secondary" sx={{ mt: 2, maxWidth: 440 }}>The priorities and principles shaping constituency service and national policy work.</Typography>
            <Box role="tablist" aria-label="Office commitments" sx={{ display: 'inline-flex', mt: 3.5, p: 0.5, bgcolor: alpha('#176044', 0.08), borderRadius: 999 }}>
              {tabs.map((tab) => {
                const selected = briefView === tab.id;
                return (
                  <Button key={tab.id} role="tab" aria-selected={selected} aria-controls={`about-panel-${tab.id}`} onClick={() => setBriefView(tab.id)} sx={{ minHeight: 40, color: selected ? 'primary.contrastText' : 'primary.dark', bgcolor: selected ? 'primary.main' : 'transparent', '&:hover': { bgcolor: selected ? 'primary.dark' : alpha('#176044', 0.08) } }}>{tab.label}</Button>
                );
              })}
            </Box>
          </Box>

          <Box id={`about-panel-${briefView}`} role="tabpanel" sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {(briefView === 'priorities' ? achievements.map((item) => ({ title: item, description: '' })) : principles).map((item, index) => (
              <Box key={`${item.title}-${index}`} className="scroll-reveal" sx={{ display: 'grid', gridTemplateColumns: { xs: '44px minmax(0, 1fr)', sm: '64px minmax(0, 1fr)' }, gap: { xs: 1.5, sm: 2.5 }, py: { xs: 2.5, md: 3.25 }, borderBottom: '1px solid', borderColor: 'divider', alignItems: 'start' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: index === 0 ? 'primary.main' : alpha('#176044', 0.09), color: index === 0 ? 'primary.contrastText' : 'primary.main' }}>
                  {briefView === 'priorities' ? <ArrowForward fontSize="small" /> : <VerifiedOutlined fontSize="small" />}
                </Box>
                <Box>
                  <Typography variant="h5" sx={{ fontSize: { xs: '1.08rem', md: '1.22rem' }, lineHeight: 1.45 }}>{item.title}</Typography>
                  {item.description && <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 680 }}>{item.description}</Typography>}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
