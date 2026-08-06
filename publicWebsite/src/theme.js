import { alpha, createTheme } from '@mui/material/styles';

const palette = {
  ink: '#14231d',
  green: '#176044',
  greenDark: '#0e3f2d',
  greenSoft: '#dfece5',
  canvas: '#f5f7f5',
  surface: '#fbfcfb',
  mist: '#e8eeea',
  accent: '#d69a35',
  fog: '#53645c',
  line: '#ced8d2',
  deep: '#0b2e21',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.green,
      dark: palette.greenDark,
      light: '#34765d',
      contrastText: '#f8fbf9',
    },
    secondary: {
      main: palette.accent,
      dark: '#9a671d',
      light: '#e6b45b',
      contrastText: '#17251f',
    },
    background: {
      default: palette.canvas,
      paper: palette.surface,
    },
    text: {
      primary: palette.ink,
      secondary: palette.fog,
    },
    divider: palette.line,
    success: { main: '#247349' },
    warning: { main: '#a9681d' },
    error: { main: '#a83f38' },
    info: { main: '#326f84' },
  },
  typography: {
    fontFamily: '"Onest", "Segoe UI", sans-serif',
    h1: { fontWeight: 740, lineHeight: 1.02, letterSpacing: '-0.035em' },
    h2: { fontWeight: 720, lineHeight: 1.06, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.025em' },
    h4: { fontWeight: 680, lineHeight: 1.14, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.015em' },
    h6: { fontWeight: 700 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0 },
    overline: { fontWeight: 720, letterSpacing: '0.1em', textTransform: 'uppercase' },
    body1: { lineHeight: 1.72 },
    body2: { lineHeight: 1.62 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--site-green': palette.green,
          '--site-green-dark': palette.greenDark,
          '--site-ink': palette.ink,
          '--site-accent': palette.accent,
          '--site-canvas': palette.canvas,
          '--site-surface': palette.surface,
          '--site-line': palette.line,
          '--site-ease': 'cubic-bezier(0.16, 1, 0.3, 1)',
        },
        html: { scrollBehavior: 'smooth', backgroundColor: palette.canvas },
        body: {
          margin: 0,
          backgroundColor: palette.canvas,
          backgroundImage: 'radial-gradient(circle at 8% 0%, rgba(23,96,68,0.06), transparent 28%)',
          color: palette.ink,
          WebkitFontSmoothing: 'antialiased',
        },
        'h1, h2, h3': { textWrap: 'balance' },
        'p': { textWrap: 'pretty' },
        a: { color: 'inherit', textDecoration: 'none' },
        'img': { maxWidth: '100%' },
        '::selection': { backgroundColor: alpha(palette.green, 0.18) },
        '.scroll-reveal': {
          transform: 'translateY(0)',
          opacity: 1,
        },
        '@supports (animation-timeline: view())': {
          '.scroll-reveal': {
            animationName: 'public-site-reveal',
            animationDuration: '1ms',
            animationFillMode: 'both',
            animationTimingFunction: 'linear',
            animationTimeline: 'view()',
            animationRange: 'entry 5% cover 32%',
          },
        },
        '@keyframes public-site-reveal': {
          from: { transform: 'translateY(22px)', opacity: 0.72 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
        '@keyframes service-progress': {
          from: { transform: 'scaleY(0)' },
          to: { transform: 'scaleY(1)' },
        },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
          '.scroll-reveal': { transform: 'none !important', opacity: '1 !important' },
        },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: 'xl' },
      styleOverrides: {
        root: { paddingLeft: 24, paddingRight: 24 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 999,
          paddingInline: 20,
          paddingBlock: 9,
          whiteSpace: 'nowrap',
          transition: 'transform 220ms var(--site-ease), background-color 220ms var(--site-ease), border-color 220ms var(--site-ease)',
          '&:active': { transform: 'translateY(1px) scale(0.99)' },
          '&:focus-visible': { outline: `3px solid ${alpha(palette.accent, 0.45)}`, outlineOffset: 2 },
        },
        containedPrimary: { backgroundColor: palette.green, '&:hover': { backgroundColor: palette.greenDark } },
        containedSecondary: { backgroundColor: palette.accent, '&:hover': { backgroundColor: '#c38729' } },
        outlined: { borderWidth: 1, borderColor: alpha(palette.green, 0.35) },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${alpha(palette.green, 0.12)}`,
          boxShadow: 'none',
          backgroundImage: 'none',
          backgroundColor: palette.surface,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 14 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 999, fontWeight: 700 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: 44,
          minHeight: 44,
          '&:focus-visible': { outline: `3px solid ${alpha(palette.accent, 0.45)}`, outlineOffset: 2 },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: palette.surface,
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: alpha(palette.green, 0.5) },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
        },
        notchedOutline: { borderColor: alpha(palette.green, 0.28) },
      },
    },
  },
});

export default theme;
