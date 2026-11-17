import { Check as CheckIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useEffect, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

export function CopyButton({ code }: { code: string }): ReactElement {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <Tooltip title={copied ? t('copied') : t('copy')}>
      <IconButton
        size='small'
        aria-label={copied ? t('copied') : t('copy')}
        onClick={() => {
          if (typeof navigator !== 'undefined') {
            void navigator.clipboard?.writeText(code).catch(() => {});
          }
          setCopied(true);
        }}
        sx={{
          position: 'absolute',
          top: 4,
          right: 4,
          zIndex: 1,
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
        }}
      >
        {copied ? <CheckIcon fontSize='small' /> : <ContentCopyIcon fontSize='small' />}
      </IconButton>
    </Tooltip>
  );
}
