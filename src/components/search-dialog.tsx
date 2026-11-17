import { Close as CloseIcon, Search as SearchIcon } from '@mui/icons-material';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';

import { highlightText } from '../highlight-text';
import type { SearchDocument } from '../search';

interface SearchDialogProps {
  open: boolean;
  search: (query: string) => SearchDocument[];
  onNavigate: (pathname: string) => void;
  onClose: () => void;
}

export function SearchDialog({
  open,
  search,
  onNavigate,
  onClose,
}: SearchDialogProps): ReactElement {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(query).slice(0, 8), [search, query]);

  function handleClose() {
    setQuery('');
    setActiveIndex(0);
    onClose();
  }

  function select(item: SearchDocument) {
    onNavigate(item.pathname);
    handleClose();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      const item = results[activeIndex];
      if (item) select(item);
    } else if (event.key === 'Escape') {
      handleClose();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='sm'
      fullWidth
      aria-label={t('search')}
      TransitionProps={{ onEntered: () => inputRef.current?.focus() }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <TextField
          inputRef={inputRef}
          fullWidth
          placeholder={t('searchPlaceholder')}
          aria-label={t('search')}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={onKeyDown}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position='end'>
                <IconButton edge='end' onClick={handleClose} aria-label={t('close')}>
                  <CloseIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, maxHeight: '60vh' }}>
        {results.length > 0 ? (
          <List>
            {results.map((item, index) => (
              <ListItem
                key={`${item.locale}:${item.pathname}`}
                disablePadding
                selected={index === activeIndex}
                onMouseEnter={() => setActiveIndex(index)}
              >
                <ListItemButton onClick={() => select(item)}>
                  <ListItemText
                    primary={highlightText(item.title, query)}
                    secondary={highlightText(item.content.slice(0, 140), query)}
                    primaryTypographyProps={{ fontWeight: index === activeIndex ? 600 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 3 }}>
            <Typography color='text.secondary'>{t('noSearchResults')}</Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
