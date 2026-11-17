import { Box, useTheme } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';
import type { BundledLanguage } from 'shiki';

import { getHighlighter } from '../code-highlight';
import { CopyButton } from './copy-button';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language }: CodeBlockProps): ReactElement {
  const { palette } = useTheme();
  const shikiTheme = palette.mode === 'dark' ? 'github-dark' : 'github-light';
  const [html, setHtml] = useState<string>();

  useEffect(() => {
    let cancelled = false;
    getHighlighter()
      .then((highlighter) => {
        if (cancelled) return;
        const normalized = language?.toLowerCase();
        const lang = (
          normalized && highlighter.getLoadedLanguages().includes(normalized) ? normalized : 'text'
        ) as BundledLanguage;
        setHtml(
          highlighter.codeToHtml(code, {
            lang,
            theme: shikiTheme,
          }),
        );
      })
      .catch(() => {
        // Highlighting is best-effort; the plain code fallback stays visible.
      });
    return () => {
      cancelled = true;
    };
  }, [code, language, shikiTheme]);

  return (
    <Box
      sx={{
        position: 'relative',
        mb: 2,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        overflow: 'hidden',
        '& pre': {
          m: 0,
          p: 2,
          overflowX: 'auto',
          fontSize: '0.875em',
        },
      }}
    >
      <CopyButton code={code} />
      {html ? (
        <Box className='vited-material-code' dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <Box component='pre'>
          <code>{code}</code>
        </Box>
      )}
    </Box>
  );
}
