import { ThemeProvider } from '@mui/material';
import { useMemo, type ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { Router } from 'wouter';

import { ThemeApp } from './components/theme-app';
import { themeI18n } from './i18n';
import { buildTheme } from './theme';
import type { VitedThemeProps } from './types';
import { useColorScheme } from './use-color-scheme';

export type { VitedMenuEntry, VitedPage, VitedRoute, VitedThemeProps } from './types';

export function VitedTheme(props: VitedThemeProps): ReactElement {
  const [mode, toggleMode] = useColorScheme();
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <I18nextProvider i18n={themeI18n}>
        <Router base={props.basePath ?? ''}>
          <ThemeApp {...props} colorScheme={mode} onToggleColorScheme={toggleMode} />
        </Router>
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default VitedTheme;
