import {
  Check as CheckIcon,
  Close as CloseIcon,
  ContentCopy as ContentCopyIcon,
  DarkMode as DarkModeIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Favorite as FavoriteIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  LightMode as LightModeIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  Chip,
  Collapse,
  Container,
  CssBaseline,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  createTheme,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import parse, { Element as HtmlElement, type DOMNode } from 'html-react-parser';
import React, {
  type ComponentType,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Children, isValidElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { createHighlighter, type BundledLanguage } from 'shiki';
import { Link, Router, useLocation } from 'wouter';

import { themeI18n } from './i18n';
import { getProjectLinks } from './project-links';
import { createPageSearch, type SearchDocument } from './search';

const highlightLanguages: BundledLanguage[] = [
  'bash',
  'css',
  'diff',
  'html',
  'javascript',
  'json',
  'jsx',
  'markdown',
  'mdx',
  'shellscript',
  'typescript',
  'tsx',
  'yaml',
];

let highlighterPromise: ReturnType<typeof createHighlighter> | undefined;

function getHighlighter(): ReturnType<typeof createHighlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: highlightLanguages,
  });
  return highlighterPromise;
}

const emptyLocales: string[] = [];

const colorSchemeStorageKey = 'vited-theme-material-color-scheme';

interface MarkdownElementProps {
  children?: ReactNode;
  html?: string;
}

type MarkdownComponents = Record<string, ComponentType<MarkdownElementProps>>;

export interface VitedPage {
  /** Route without locale prefix, e.g. `/guide/start`. */
  path: string;
  locale: string;
  /** Path matched by the client router, e.g. `/zh/guide/start/`. */
  pathname: string;
  /** Page URL with the base URL, e.g. `/docs/zh/guide/start/`. */
  url: string;
  title: string;
  frontmatter: Record<string, unknown>;
  component: ComponentType<{ components?: MarkdownComponents }>;
}

export interface VitedRoute {
  /** Route without locale prefix, e.g. `/guide/start`. */
  path: string;
  locale: string;
  /** Path matched by the client router, e.g. `/zh/guide/start/`. */
  pathname: string;
  /** Page URL with the base URL, e.g. `/docs/zh/guide/start/`. */
  url: string;
  /** Index of the page that renders this route. */
  page: number;
}

export interface VitedMenuEntry {
  divider?: boolean;
  text?: string;
  path?: string;
  /** Pathnames of the entry per locale, e.g. `{ en: '/guide/', zh: '/zh/guide/' }`. */
  pathnames?: Record<string, string>;
  /** URLs of the entry per locale, e.g. `{ en: '/docs/guide/', zh: '/docs/zh/guide/' }`. */
  urls?: Record<string, string>;
  file?: string;
  link?: string;
  flag?: 'experimental' | 'new' | 'deprecated';
  children?: VitedMenuEntry[];
}

export interface VitedThemeProps {
  pages: VitedPage[];
  /** Every page route in every configured locale, with the page that renders it. */
  routes: VitedRoute[];
  /** Route lookup by pathname, with and without the trailing slash. */
  routeIndex: Record<string, number>;
  title?: string;
  description?: string;
  /** Project favicon URL, displayed to the left of the title. */
  favicon?: string;
  supportedLocales?: string[];
  baseURL?: string;
  /** Base URL of the client router, empty for the site root. */
  basePath?: string;
  menu?: VitedMenuEntry[] | null;
  searchIndex?: SearchDocument[];
  packageJSON?: Record<string, unknown>;
}

type ColorScheme = 'light' | 'dark';

function getSystemColorScheme(): ColorScheme {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function readColorSchemePreference(): ColorScheme | 'auto' {
  try {
    const stored = globalThis.localStorage?.getItem(colorSchemeStorageKey);
    return stored === 'light' || stored === 'dark' ? stored : 'auto';
  } catch {
    return 'auto';
  }
}

/** Follows the system color scheme by default and persists explicit choices. */
function useColorScheme(): [ColorScheme, () => void] {
  const [preference, setPreference] = useState<ColorScheme | 'auto'>(readColorSchemePreference);
  const [system, setSystem] = useState<ColorScheme>(getSystemColorScheme);

  useEffect(() => {
    const media = globalThis.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSystem(media.matches ? 'dark' : 'light');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const scheme = preference === 'auto' ? system : preference;

  const toggle = useCallback(() => {
    const next = scheme === 'dark' ? 'light' : 'dark';
    try {
      globalThis.localStorage?.setItem(colorSchemeStorageKey, next);
    } catch {
      // Storage may be unavailable, e.g. in private browsing.
    }
    setPreference(next);
  }, [scheme]);

  return [scheme, toggle];
}

function buildTheme(mode: ColorScheme) {
  return createTheme({
    palette: {
      mode,
      primary: { main: '#1976d2' },
      ...(mode === 'dark' ? { background: { default: '#0a0a0a', paper: '#161616' } } : {}),
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          '.vited-material-content': {
            '& img': { maxWidth: '100%', height: 'auto' },
            '& :not(pre) > code': {
              padding: '0.125rem 0.375rem',
              fontSize: '0.875em',
              borderRadius: 4,
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
            },
            '& table': {
              display: 'block',
              maxWidth: '100%',
              marginBottom: '1rem',
              overflowX: 'auto',
              borderCollapse: 'collapse',
            },
            '& table th, & table td': {
              padding: '0.375rem 0.75rem',
              border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
            },
          },
        },
      },
    },
  });
}

function ThemeApp({
  pages,
  routes,
  routeIndex,
  title = '',
  description = '',
  favicon = '',
  supportedLocales = emptyLocales,
  menu,
  searchIndex = [],
  packageJSON = {},
  colorScheme,
  onToggleColorScheme,
}: VitedThemeProps & {
  colorScheme: ColorScheme;
  onToggleColorScheme: () => void;
}): ReactElement {
  const muiTheme = useTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('md'));
  const locales = useMemo(
    () =>
      supportedLocales.length > 0
        ? supportedLocales
        : [...new Set(pages.map((item) => item.locale))],
    [pages, supportedLocales],
  );
  const [pathname, navigate] = useLocation();
  const route = routes[routeIndex[pathname] ?? -1];
  const locale = route?.locale ?? locales[0] ?? 'en';
  const Content = route ? pages[route.page].component : undefined;
  const { t, i18n } = useTranslation();
  const [mobileOpened, setMobileOpened] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);
  const projectLinks = useMemo(() => getProjectLinks(packageJSON), [packageJSON]);
  const navigationPages = useMemo(
    () => pages.filter((item) => item.locale === locale),
    [pages, locale],
  );
  // A single page needs no navigation, unless the site configures a menu of its own.
  const showNavigation = (menu?.length ?? 0) > 0 || navigationPages.length > 1;
  const markdownComponents = useMemo<MarkdownComponents>(
    () => ({ html: MarkdownHtml, pre: MarkdownCodeBlock }),
    [],
  );
  const searchPages = useMemo(
    () => searchIndex.filter((item) => item.locale.toLowerCase() === locale.toLowerCase()),
    [searchIndex, locale],
  );
  const search = useMemo(() => createPageSearch(searchPages), [searchPages]);
  const navigation = menu?.length ? (
    <MenuItems
      entries={menu}
      locale={locale}
      activePath={route?.path}
      onNavigate={() => setMobileOpened(false)}
    />
  ) : (
    <PageNavigation
      pages={navigationPages}
      activePath={route?.path}
      onNavigate={() => setMobileOpened(false)}
    />
  );

  useEffect(() => {
    globalThis.document.documentElement.lang = locale;
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpened(true);
      }
    }
    globalThis.document.addEventListener('keydown', onKeyDown);
    return () => globalThis.document.removeEventListener('keydown', onKeyDown);
  }, []);

  function changeLocale(nextLocale: string) {
    // Keep the reader on the same route when it exists in the next locale.
    const nextRoute =
      routes.find((item) => item.path === route?.path && item.locale === nextLocale) ??
      routes.find((item) => item.locale === nextLocale);
    if (!nextRoute) return;
    const url = new globalThis.URL(globalThis.location.href);
    url.searchParams.delete('lang');
    navigate(`${nextRoute.pathname}${url.search}${url.hash}`);
  }

  const drawerContent = (
    <Box sx={{ width: 280 }} role='presentation'>
      <Toolbar>
        <Typography variant='overline' color='text.secondary'>
          {t('navigation')}
        </Typography>
      </Toolbar>
      <Divider />
      <List component='nav' aria-label={t('navigation')} sx={{ py: 1 }}>
        {navigation}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <AppBar position='sticky' color='default' elevation={1}>
        <Toolbar sx={{ gap: 1, flexWrap: 'nowrap' }}>
          {showNavigation ? (
            <IconButton
              edge='start'
              color='inherit'
              aria-label={mobileOpened ? t('closeNavigation') : t('openNavigation')}
              onClick={() => setMobileOpened((opened) => !opened)}
              sx={{ display: { md: 'none' } }}
            >
              {mobileOpened ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          ) : undefined}
          {favicon ? (
            <Box component='img' src={favicon} alt='' sx={{ width: 24, height: 24 }} />
          ) : undefined}
          <Stack spacing={0} sx={{ minWidth: 0, flex: '0 1 auto' }}>
            <Typography variant='subtitle1' fontWeight={700} noWrap>
              {title || 'Documentation'}
            </Typography>
            {description ? (
              <Typography
                variant='caption'
                color='text.secondary'
                noWrap
                sx={{ display: { xs: 'none', sm: 'block' } }}
              >
                {description}
              </Typography>
            ) : undefined}
          </Stack>
          <Stack
            direction='row'
            spacing={0.5}
            alignItems='center'
            sx={{ ml: 'auto', flexWrap: 'nowrap' }}
          >
            {searchIndex.length > 0 ? (
              <Button
                variant='outlined'
                size='small'
                startIcon={<SearchIcon fontSize='small' />}
                onClick={() => setSearchOpened(true)}
                sx={{
                  justifyContent: 'space-between',
                  width: { xs: 180, sm: 250 },
                  textTransform: 'none',
                  fontWeight: 400,
                  color: 'text.secondary',
                }}
                aria-label={`${t('search')} ${getSearchShortcut()}`}
              >
                <Typography variant='body2'>{t('search')}</Typography>
                <Chip
                  label={getSearchShortcut()}
                  size='small'
                  variant='outlined'
                  sx={{ height: 20, fontSize: 11 }}
                />
              </Button>
            ) : undefined}
            {projectLinks.github ? (
              <Tooltip title={t('github')}>
                <IconButton
                  component='a'
                  href={projectLinks.github}
                  target='_blank'
                  rel='noreferrer'
                  color='inherit'
                  aria-label={t('github')}
                >
                  <GitHubIcon />
                </IconButton>
              </Tooltip>
            ) : undefined}
            {projectLinks.funding ? (
              <Tooltip title={t('donate')}>
                <IconButton
                  component='a'
                  href={projectLinks.funding}
                  target='_blank'
                  rel='noreferrer'
                  color='inherit'
                  aria-label={t('donate')}
                >
                  <FavoriteIcon sx={{ color: 'error.main' }} />
                </IconButton>
              </Tooltip>
            ) : undefined}
            {locales.length > 1 ? (
              <FormControl size='small' sx={{ minWidth: 120 }}>
                <Select
                  value={locale}
                  onChange={(event) => changeLocale(event.target.value)}
                  aria-label={t('language')}
                  startAdornment={
                    <InputAdornment position='start'>
                      <LanguageIcon fontSize='small' />
                    </InputAdornment>
                  }
                >
                  {locales.map((item) => (
                    <MenuItem key={item} value={item}>
                      {new Intl.DisplayNames([item], { type: 'language' }).of(item) ?? item}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ) : undefined}
            <ColorSchemeToggle scheme={colorScheme} onToggle={onToggleColorScheme} />
          </Stack>
        </Toolbar>
      </AppBar>

      {showNavigation && isDesktop ? (
        <Box
          component='aside'
          sx={{
            width: 280,
            flexShrink: 0,
            borderRight: 1,
            borderColor: 'divider',
            position: 'sticky',
            top: 0,
            height: '100vh',
            overflowY: 'auto',
          }}
        >
          {drawerContent}
        </Box>
      ) : undefined}

      {showNavigation ? (
        <Drawer
          variant='temporary'
          open={mobileOpened}
          onClose={() => setMobileOpened(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: 280 } }}
        >
          {drawerContent}
        </Drawer>
      ) : undefined}

      <Box component='main' sx={{ flexGrow: 1, minWidth: 0 }}>
        <Container maxWidth='lg' sx={{ py: 3 }}>
          {Content ? (
            <Box className='vited-material-content'>
              <Content components={markdownComponents} />
            </Box>
          ) : (
            <Typography color='text.secondary'>{t('noDocuments')}</Typography>
          )}
        </Container>
      </Box>

      {searchIndex.length > 0 ? (
        <SearchDialog
          open={searchOpened}
          search={search}
          onNavigate={(path) => {
            navigate(path);
            setMobileOpened(false);
          }}
          onClose={() => setSearchOpened(false)}
        />
      ) : undefined}
    </Box>
  );
}

interface ColorSchemeToggleProps {
  scheme: ColorScheme;
  onToggle: () => void;
}

function ColorSchemeToggle({ scheme, onToggle }: ColorSchemeToggleProps): ReactElement {
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

export function VitedTheme(props: VitedThemeProps): ReactElement {
  const [mode, toggleMode] = useColorScheme();
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <I18nextProvider i18n={themeI18n}>
        <Router base={props.basePath ?? ''}>
          <ThemeApp {...props} colorScheme={mode} onToggleColorScheme={toggleMode} />
        </Router>
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default VitedTheme;

interface SearchDialogProps {
  open: boolean;
  search: (query: string) => SearchDocument[];
  onNavigate: (pathname: string) => void;
  onClose: () => void;
}

function SearchDialog({ open, search, onNavigate, onClose }: SearchDialogProps): ReactElement {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => search(query).slice(0, 8), [search, query]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

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
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth aria-label={t('search')}>
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

function highlightText(text: string, query: string): ReactNode {
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

interface PageNavigationNode {
  key: string;
  title: string;
  page?: VitedPage;
  children: PageNavigationNode[];
}

interface NavigationProps {
  locale?: string;
  activePath?: string;
  onNavigate: () => void;
}

function PageNavigation({
  pages,
  activePath,
  onNavigate,
}: NavigationProps & { pages: VitedPage[] }): ReactElement {
  const nodes: PageNavigationNode[] = [];

  for (const page of pages) {
    let level = nodes;
    const segments = page.path
      .split('/')
      .filter(Boolean)
      .map((segment) => decodeURIComponent(segment));
    if (segments.length === 0) {
      level.push({ key: `${page.locale}:${page.path}`, title: page.title, page, children: [] });
      continue;
    }

    let route = '';
    for (const segment of segments) {
      route += `/${encodeURIComponent(segment)}`;
      let node = level.find((item) => item.key === route);
      if (!node) {
        node = { key: route, title: humanize(segment), children: [] };
        level.push(node);
      }
      level = node.children;
      if (route === page.path) {
        node.title = page.title;
        node.page = page;
      }
    }
  }

  return <>{renderPageNavigationNodes(nodes, { activePath, onNavigate })}</>;
}

function renderPageNavigationNodes(nodes: PageNavigationNode[], props: NavigationProps): ReactNode {
  return nodes.map((node) => (
    <NavTreeItem
      key={node.key}
      label={node.title}
      active={node.page?.path === props.activePath}
      defaultOpened={node.children.some(
        (child) =>
          child.page?.path === props.activePath || props.activePath?.startsWith(`${child.key}/`),
      )}
      to={node.page?.pathname}
      onNavigate={props.onNavigate}
    >
      {node.children.length > 0 ? renderPageNavigationNodes(node.children, props) : undefined}
    </NavTreeItem>
  ));
}

function MenuItems({
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

interface NavTreeItemProps {
  label: string;
  active?: boolean;
  defaultOpened?: boolean;
  /** Internal route rendered with the client router. */
  to?: string;
  /** External link rendered as a plain anchor. */
  href?: string;
  onNavigate: () => void;
  children?: ReactNode;
}

function NavTreeItem({
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

  const button = (
    <ListItemButton
      selected={active}
      onClick={() => {
        toggle?.();
        onNavigate();
      }}
      sx={{
        py: 0.75,
        borderRadius: 1,
        mx: 1,
        width: 'auto',
        '&.Mui-selected': {
          fontWeight: 600,
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
        },
      }}
    >
      <ListItemText primary={label} primaryTypographyProps={{ noWrap: true }} />
      {hasChildren ? (
        opened ? (
          <ExpandLessIcon fontSize='small' />
        ) : (
          <ExpandMoreIcon fontSize='small' />
        )
      ) : undefined}
    </ListItemButton>
  );

  let control: ReactElement;
  if (to) {
    control = (
      <Link to={to} asChild>
        {button}
      </Link>
    );
  } else if (href) {
    control = (
      <Box
        component='a'
        href={href}
        sx={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
      >
        {button}
      </Box>
    );
  } else {
    control = button;
  }

  return (
    <>
      <ListItem disablePadding>{control}</ListItem>
      {hasChildren ? (
        <Collapse in={opened} timeout='auto'>
          <List component='div' disablePadding sx={{ pl: 3 }}>
            {children}
          </List>
        </Collapse>
      ) : undefined}
    </>
  );
}

function getSearchShortcut(): string {
  return globalThis.navigator !== undefined &&
    /Mac|iPhone|iPad|iPod/.test(globalThis.navigator.platform)
    ? '⌘K'
    : 'Ctrl+K';
}

function humanize(value: string): string {
  return decodeURIComponent(value).replaceAll(/[-_]/g, ' ');
}

function MarkdownHtml({ html = '' }: MarkdownElementProps): ReactElement {
  return <>{parse(html, { replace: replaceMarkdownHtmlNode })}</>;
}

function replaceMarkdownHtmlNode(node: DOMNode) {
  if (!(node instanceof HtmlElement) || node.name !== 'pre') return;
  const codeNode = node.children.find(
    (child): child is HtmlElement => child instanceof HtmlElement && child.name === 'code',
  );
  if (!codeNode) return;
  const code = codeNode.children.map(getHtmlText).join('');
  return (
    <MarkdownCodeBlock>
      <code className={codeNode.attribs.class}>{code}</code>
    </MarkdownCodeBlock>
  );
}

function MarkdownCodeBlock({ children }: MarkdownElementProps): ReactElement {
  const codeElement = Children.toArray(children).find(
    (child): child is ReactElement<{ className?: string; children?: ReactNode }> =>
      isValidElement(child) && child.type === 'code',
  );
  if (!codeElement) return <pre>{children}</pre>;

  const language = codeElement.props.className?.match(/(?:^|\s)language-([\w+#.-]+)/)?.[1];
  return <CodeBlock code={getReactText(codeElement.props.children)} language={language} />;
}

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code, language }: CodeBlockProps): ReactElement {
  const theme = useTheme();
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
            themes: { light: 'github-light', dark: 'github-dark' },
          }),
        );
      })
      .catch(() => {
        // Highlighting is best-effort; the plain code fallback stays visible.
      });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

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
        '& .shiki, & .shiki span': {
          color: 'var(--shiki-light)',
          fontStyle: 'var(--shiki-light-font-style)',
          fontWeight: 'var(--shiki-light-font-weight)',
          textDecoration: 'var(--shiki-light-text-decoration)',
        },
        ...(theme.palette.mode === 'dark'
          ? {
              '& .shiki, & .shiki span': {
                color: 'var(--shiki-dark) !important',
                backgroundColor: 'var(--shiki-dark-bg) !important',
                fontStyle: 'var(--shiki-dark-font-style) !important',
                fontWeight: 'var(--shiki-dark-font-weight) !important',
                textDecoration: 'var(--shiki-dark-text-decoration) !important',
              },
            }
          : {}),
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

function CopyButton({ code }: { code: string }): ReactElement {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = globalThis.setTimeout(() => setCopied(false), 2000);
    return () => globalThis.clearTimeout(timer);
  }, [copied]);

  return (
    <Tooltip title={copied ? t('copied') : t('copy')}>
      <IconButton
        size='small'
        aria-label={copied ? t('copied') : t('copy')}
        onClick={() => {
          void globalThis.navigator?.clipboard?.writeText(code).catch(() => {});
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

function getHtmlText(node: DOMNode): string {
  if (node.type === 'text') return node.data;
  if (node instanceof HtmlElement) return node.children.map(getHtmlText).join('');
  return '';
}

function getReactText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map((child) => getReactText(child)).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) return getReactText(node.props.children);
  return '';
}
