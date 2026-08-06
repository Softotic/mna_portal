import { alpha, createTheme } from '@mui/material/styles';

const pine = '#0B5D3B';
const pineDark = '#073E29';
const ink = '#14231C';
const border = '#DCE5E0';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: pine,
      light: '#3B8063',
      dark: pineDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#355F7A',
      light: '#5F8095',
      dark: '#244357',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F3F6F4',
      paper: '#FFFFFF',
    },
    success: { main: '#26724C', dark: '#185737' },
    warning: { main: '#A35F09', dark: '#794400' },
    error: { main: '#B83B43', dark: '#8E2730' },
    info: { main: '#356B8C', dark: '#27536D' },
    divider: border,
    text: {
      primary: ink,
      secondary: '#52645B',
      disabled: '#89978F',
    },
    action: {
      hover: alpha(pine, 0.055),
      selected: alpha(pine, 0.095),
      focus: alpha(pine, 0.14),
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    h4: { fontSize: '1.75rem', lineHeight: 1.25, fontWeight: 750, letterSpacing: '-0.025em' },
    h5: { fontSize: '1.35rem', lineHeight: 1.3, fontWeight: 720, letterSpacing: '-0.018em' },
    h6: { fontSize: '1rem', lineHeight: 1.45, fontWeight: 680 },
    subtitle1: { fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 600 },
    subtitle2: { fontSize: '0.8125rem', lineHeight: 1.45, fontWeight: 680 },
    body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
    body2: { fontSize: '0.84375rem', lineHeight: 1.55 },
    caption: { fontSize: '0.75rem', lineHeight: 1.45 },
    button: { fontSize: '0.84375rem', fontWeight: 680, textTransform: 'none', letterSpacing: 0 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(20, 35, 28, 0.05)',
    '0 2px 6px rgba(20, 35, 28, 0.07)',
    '0 4px 8px rgba(20, 35, 28, 0.08)',
    '0 6px 12px rgba(20, 35, 28, 0.09)',
    ...Array(20).fill('0 8px 20px rgba(20, 35, 28, 0.10)'),
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { scrollBehavior: 'smooth' },
        body: {
          minWidth: 320,
          backgroundColor: '#F3F6F4',
          color: ink,
          WebkitFontSmoothing: 'antialiased',
        },
        '*': { boxSizing: 'border-box' },
        '*:focus-visible': {
          outline: `3px solid ${alpha(pine, 0.28)}`,
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          html: { scrollBehavior: 'auto' },
          '*, *::before, *::after': {
            animationDuration: '0.01ms !important',
            animationIterationCount: '1 !important',
            transitionDuration: '0.01ms !important',
          },
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 9,
          padding: '8px 16px',
          boxShadow: 'none',
          transition: 'background-color 180ms cubic-bezier(0.16, 1, 0.3, 1), transform 180ms cubic-bezier(0.16, 1, 0.3, 1)',
          '&:active': { transform: 'translateY(1px)' },
        },
        containedPrimary: {
          '&:hover': { backgroundColor: pineDark, boxShadow: 'none' },
        },
        outlined: { borderColor: '#B9C9C1' },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          transition: 'background-color 160ms ease, transform 160ms ease',
          '&:active': { transform: 'scale(0.96)' },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          borderRadius: 14,
          border: `1px solid ${border}`,
          boxShadow: 'none',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        rounded: { borderRadius: 12 },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderRadius: 0,
          overflowX: 'auto',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: { minWidth: 720 },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          '& .MuiTableCell-head': {
            backgroundColor: '#F7F9F8',
            color: '#405149',
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.015em',
            whiteSpace: 'nowrap',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottomColor: '#E7EDE9',
          padding: '13px 16px',
          verticalAlign: 'middle',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 150ms ease',
          '&:last-of-type .MuiTableCell-body': { borderBottom: 0 },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: { borderTop: `1px solid ${border}` },
        toolbar: {
          minHeight: 58,
          paddingInline: 16,
          '@media (max-width: 599px)': {
            paddingInline: 8,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: 4,
          },
        },
        selectLabel: { '@media (max-width: 599px)': { display: 'none' } },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { height: 28, borderRadius: 7, fontWeight: 650 },
        label: { paddingInline: 9 },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: 14, border: `1px solid ${border}` },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { fontSize: '1.125rem', fontWeight: 720, padding: '20px 24px 16px' } },
    },
    MuiDialogActions: {
      styleOverrides: { root: { padding: '16px 24px', gap: 8 } },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: 9,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#B9C9C1' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#71877C' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
        },
        input: {
          '&::placeholder': { color: '#66786F', opacity: 1 },
        },
      },
    },
    MuiAlert: {
      styleOverrides: { root: { borderRadius: 10, alignItems: 'center' } },
    },
    MuiTooltip: {
      styleOverrides: { tooltip: { fontSize: '0.75rem', borderRadius: 7 } },
    },
    MuiTabs: {
      styleOverrides: { root: { minHeight: 48 }, indicator: { height: 3, borderRadius: '3px 3px 0 0' } },
    },
    MuiTab: {
      styleOverrides: { root: { minHeight: 48, textTransform: 'none', fontWeight: 650 } },
    },
  },
});

export default theme;
