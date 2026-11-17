import { createTheme } from '@mui/material';

import type { ColorScheme } from './types';

export function buildTheme(mode: ColorScheme) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      ...(mode === 'dark' ? { background: { default: '#0a0a0a', paper: '#161616' } } : {}),
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '.vited-material-content': {
            '& img': { maxWidth: '100%', height: 'auto' },
            '& a': {
              color: mode === 'dark' ? '#90caf9' : '#1976d2',
            },
            '& :not(pre) > code': {
              padding: '0.125rem 0.375rem',
              fontSize: '0.875em',
              borderRadius: 4,
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            },
            '& table': {
              display: 'block',
              maxWidth: '100%',
              marginBottom: '1rem',
              overflowX: 'auto',
              borderCollapse: 'collapse',
            },
            '& table th, & table td': {
              padding: '0.375rem 0.75rem',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
            },
          },
        },
      },
    },
  });
}
