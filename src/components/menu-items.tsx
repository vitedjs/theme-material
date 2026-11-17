import { Divider } from '@mui/material';
import type { ReactElement } from 'react';

import type { VitedMenuEntry } from '../types';
import { NavTreeItem } from './nav-tree-item';
import type { NavigationProps } from './navigation-types';

export function MenuItems({
  entries,
  locale,
  activePath,
  onNavigate,
}: NavigationProps & { entries: VitedMenuEntry[] }): ReactElement {
  return (
    <>
      {entries.map((entry, index) => {
        if (entry.divider) {
          return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
        }
        const href = entry.path ? (entry.pathnames?.[locale ?? ''] ?? '#') : (entry.link ?? '#');
        const label = entry.text ?? entry.file ?? entry.path ?? entry.link ?? '';
        return (
          <NavTreeItem
            key={`${href}:${index}`}
            label={label}
            active={entry.path === activePath}
            defaultOpened={Boolean(entry.children?.length)}
            to={entry.path ? href : undefined}
            href={entry.path ? undefined : href}
            onNavigate={onNavigate}
          >
            {entry.children?.length ? (
              <MenuItems
                entries={entry.children}
                locale={locale}
                activePath={activePath}
                onNavigate={onNavigate}
              />
            ) : undefined}
          </NavTreeItem>
        );
      })}
    </>
  );
}
