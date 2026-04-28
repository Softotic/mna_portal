import { alpha, createTheme } from '@mui/material/styles';

const palette = {
  ink: '#163126',
  green: '#1f5f46',
  emerald: '#2f7f5b',
  mint: '#dcebdc',
  paper: '#f7f5ef',
  sand: '#ece6d7',
  gold: '#b48a43',
  fog: '#64756d',
  line: '#d5d9cf',
  deep: '#10241b',
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: palette.green,
      dark: '#133c2d',
      light: palette.emerald,
      contrastText: '#ffffff',
    },
    secondary: {
      main: palette.gold,
      dark: '#8f692d',
      light: '#c8a05d',
      contrastText: palette.deep,
    },
    background: {
      default: palette.paper,
      paper: '#fffdfa',
    },
    text: {
      primary: palette.ink,
      secondary: palette.fog,
    },
    divider: palette.line,
    success: { main: '#2c8651' },
    warning: { main: '#b57a2b' },
    error: { main: '#b2473d' },
    info: { main: '#2f6f88' },
  },
  typography: {
    fontFamily: '"Manrope", "Segoe UI", sans-serif',
    h1: { fontFamily: '"Newsreader", "Georgia", serif', fontWeight: 700, lineHeight: 1.02, letterSpacing: '-0.04em' },
    h2: { fontFamily: '"Newsreader", "Georgia", serif', fontWeight: 700, lineHeight: 1.04, letterSpacing: '-0.04em' },
    h3: { fontFamily: '"Newsreader", "Georgia", serif', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em' },
    h4: { fontFamily: '"Newsreader", "Georgia", serif', fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em' },
    h5: { fontWeight: 800, letterSpacing: '-0.02em' },
    h6: { fontWeight: 800 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' },
    overline: { fontFamily: '"DM Mono", monospace', fontWeight: 500, letterSpacing: '0.17em', textTransform: 'uppercase' },
    body1: { lineHeight: 1.8 },
    body2: { lineHeight: 1.7 },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ':root': {
          '--site-green': palette.green,
          '--site-ink': palette.ink,
          '--site-gold': palette.gold,
          '--site-paper': palette.paper,
          '--site-line': palette.line,
        },
        html: { scrollBehavior: 'smooth' },
        body: {
          backgroundColor: palette.paper,
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(47,127,91,0.10), transparent 24%),
            radial-gradient(circle at 80% 8%, rgba(180,138,67,0.08), transparent 18%),
            linear-gradient(180deg, #fbfaf6 0%, #f4f1e9 100%)
          `,
          color: palette.ink,
        },
        a: { color: 'inherit', textDecoration: 'none' },
        '::selection': { backgroundColor: alpha(palette.green, 0.18) },
        '@media (prefers-reduced-motion: reduce)': {
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
            scrollBehavior: 'auto !important',
          },
        },
      },
    },
    MuiContainer: {
      defaultProps: { maxWidth: 'xl' },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 20,
          paddingBlock: 10,
        },
        contained: {
          boxShadow: '0 14px 30px rgba(16, 36, 27, 0.14)',
        },
        outlined: {
          borderWidth: 1.5,
          borderColor: alpha(palette.green, 0.22),
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          border: `1px solid ${alpha(palette.green, 0.08)}`,
          boxShadow: '0 18px 42px rgba(16, 36, 27, 0.06)',
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,253,249,0.96) 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(255,252,247,0.98) 100%)',
        },
        rounded: {
          borderRadius: 22,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 700,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: alpha('#ffffff', 0.92),
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: alpha(palette.green, 0.36),
          },
        },
        notchedOutline: {
          borderColor: alpha(palette.green, 0.14),
        },
      },
    },
  },
});

export default theme;
