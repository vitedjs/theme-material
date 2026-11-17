import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export function highlightText(text: string, query: string): ReactNode {
  const needle = query.trim().toLowerCase();
  if (!needle) return text;
  const lower = text.toLowerCase();
  const parts: ReactNode[] = [];
  let index = 0;
  let found = lower.indexOf(needle);
  while (found !== -1) {
    if (found > index) parts.push(text.slice(index, found));
    parts.push(
      <Box
        component='mark'
        key={found}
        sx={{
          backgroundColor: 'warning.light',
          color: 'warning.contrastText',
          borderRadius: 0.5,
          px: 0.25,
        }}
      >
        {text.slice(found, found + needle.length)}
      </Box>,
    );
    index = found + needle.length;
    found = lower.indexOf(needle, index);
  }
  parts.push(text.slice(index));
  return parts;
}
