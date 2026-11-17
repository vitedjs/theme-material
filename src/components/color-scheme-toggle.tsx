import { DarkMode as DarkModeIcon, LightMode as LightModeIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import type { ColorScheme } from '../types';

interface ColorSchemeToggleProps {
  scheme: ColorScheme;
  onToggle: () => void;
}

export function ColorSchemeToggle({ scheme, onToggle }: ColorSchemeToggleProps): ReactElement {
  const { t } = useTranslation();
  return (
    <Tooltip title={scheme === 'dark' ? t('switchToLight') : t('switchToDark')}>
      <IconButton
        color='inherit'
        onClick={onToggle}
        aria-label={scheme === 'dark' ? t('switchToLight') : t('switchToDark')}
      >
        {scheme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
