import { List, ListItemButton, ListItemText } from '@mui/material';
import { Fragment, type ReactElement } from 'react';

import type { TocHeading } from '../toc';

interface TocTreeProps {
  headings: TocHeading[];
  activeId?: string;
  ariaLabel: string;
  onNavigate?: () => void;
  depth?: number;
}

export function TocTree({
  headings,
  activeId,
  ariaLabel,
  onNavigate,
  depth = 0,
}: TocTreeProps): ReactElement {
  return (
    <List
      component={depth === 0 ? 'nav' : 'div'}
      aria-label={depth === 0 ? ariaLabel : undefined}
      dense
      disablePadding
    >
      {headings.map((heading) => (
        <Fragment key={heading.id}>
          <ListItemButton
            component='a'
            href={`#${heading.id}`}
            selected={heading.id === activeId}
            onClick={onNavigate}
            sx={{
              py: 0.25,
              pl: 1.5 + (heading.level - 2) * 1.5,
              pr: 1,
              borderLeft: 2,
              borderColor: heading.id === activeId ? 'primary.main' : 'transparent',
              borderRadius: 0,
            }}
          >
            <ListItemText
              primary={heading.text}
              primaryTypographyProps={{ variant: 'body2', noWrap: true }}
            />
          </ListItemButton>
          {heading.children.length > 0 ? (
            <TocTree
              headings={heading.children}
              activeId={activeId}
              ariaLabel={ariaLabel}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ) : undefined}
        </Fragment>
      ))}
    </List>
  );
}
