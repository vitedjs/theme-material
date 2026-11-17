import { useCallback, useEffect, useState } from 'react';

import type { ColorScheme } from './types';

const colorSchemeStorageKey = 'vited-theme-material-color-scheme';

function getSystemColorScheme(): ColorScheme {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function readColorSchemePreference(): ColorScheme | 'auto' {
  try {
    const stored = localStorage?.getItem(colorSchemeStorageKey);
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

/** Follows the system color scheme by default and persists explicit choices. */
export function useColorScheme(): [ColorScheme, () => void] {
  const [preference, setPreference] = useState<ColorScheme | 'auto'>(readColorSchemePreference);
  const [system, setSystem] = useState<ColorScheme>(getSystemColorScheme);

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystem(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const scheme = preference === 'auto' ? system : preference;

  const toggle = useCallback(() => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    try {
      localStorage?.setItem(colorSchemeStorageKey, next);
    } catch {
      // Storage may be unavailable, e.g. in private browsing.
    }
    setPreference(next);
  }, [scheme]);

  return [scheme, toggle];
}
