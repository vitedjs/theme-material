import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
  Collapse,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  alpha,
  type Theme,
} from '@mui/material';
import { Children, useState, type ReactElement, type ReactNode } from 'react';
import { Link } from 'wouter';

interface NavTreeItemProps {
  label: ReactNode;
  active?: boolean;
  defaultOpened?: boolean;
  /** Internal route rendered with the client router. */
  to?: string;
  /** External link rendered as a plain anchor. */
  href?: string;
  onNavigate: () => void;
  children?: ReactNode;
}

export function NavTreeItem({
  label,
  active = false,
  defaultOpened = false,
  to,
  href,
  onNavigate,
  children,
}: NavTreeItemProps): ReactElement {
  const [opened, setOpened] = useState(defaultOpened);
  const hasChildren = Children.count(children) > 0;
  const toggle = hasChildren ? () => setOpened((value) => !value) : undefined;
  const handleClick = () => {
    toggle?.();
    if (!hasChildren) onNavigate();
  };

  const buttonProps = {
    selected: active,
    onClick: handleClick,
    'aria-expanded': hasChildren ? opened : undefined,
    sx: {
      py: 0.75,
      borderRadius: 1,
      mx: 1,
      width: 'auto',
      '&.Mui-selected': {
        fontWeight: 600,
        backgroundColor: (theme: Theme) => alpha(theme.palette.primary.main, 0.12),
      },
    },
  };
  const buttonContent = (
    <>
      <ListItemText primary={label} primaryTypographyProps={{ noWrap: true }} />
      {hasChildren ? (
        opened ? (
          <ExpandLessIcon fontSize='small' />
        ) : (
          <ExpandMoreIcon fontSize='small' />
        )
      ) : undefined}
    </>
  );

  let control: ReactElement;
  if (to) {
    control = (
      <ListItemButton component={Link} to={to} {...buttonProps}>
        {buttonContent}
      </ListItemButton>
    );
  } else if (href) {
    control = (
      <ListItemButton component='a' href={href} {...buttonProps}>
        {buttonContent}
      </ListItemButton>
    );
  } else {
    control = <ListItemButton {...buttonProps}>{buttonContent}</ListItemButton>;
  }

  return (
    <ListItem disablePadding sx={{ display: 'block' }}>
      {control}
      {hasChildren ? (
        <Collapse in={opened} timeout='auto'>
          <List component='ul' disablePadding sx={{ pl: 3 }}>
            {children}
          </List>
        </Collapse>
      ) : undefined}
    </ListItem>
  );
}
