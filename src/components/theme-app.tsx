import {
  ArrowDropDown as ArrowDropDownIcon,
  Close as CloseIcon,
  Favorite as FavoriteIcon,
  GitHub as GitHubIcon,
  Language as LanguageIcon,
  Menu as MenuIcon,
  Search as SearchIcon,
  Toc as TocIcon,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Button,
  ButtonBase,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  Fab,
  GlobalStyles,
  IconButton,
  List,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type ReactElement,
} from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollRestore } from 'react-scroll-restore';
import { useLocation } from 'wouter';

import { formatDocumentTitle } from '../document-title';
import { formatPackageVersion } from '../package-version';
import { getProjectLinks } from '../project-links';
import { createPageSearch } from '../search';
import { collectTocHeadings, useActiveHeading, type TocHeading } from '../toc';
import type { ColorScheme, MarkdownComponents, VitedThemeProps } from '../types';
import { ColorSchemeToggle } from './color-scheme-toggle';
import { MarkdownCodeBlock } from './markdown-code-block';
import { MarkdownHtml } from './markdown-html';
import { MenuItems } from './menu-items';
import { PageNavigation } from './page-navigation';
import { SearchDialog } from './search-dialog';
import { TocTree } from './toc-tree';

const emptyLocales: string[] = [];

export function ThemeApp({
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
  basePath = '',
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
  const pageTitle = route ? pages[route.page].title : '';
  const { t, i18n } = useTranslation();
  const [mobileOpened, setMobileOpened] = useState(false);
  const [tocOpened, setTocOpened] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);
  const [languageMenu, setLanguageMenu] = useState<HTMLElement>();
  const [tocHeadings, setTocHeadings] = useState<TocHeading[]>([]);
  const activeHeadingId = useActiveHeading(tocHeadings);
  // Collect the outline when a page mounts; the keyed wrapper remounts on navigation.
  const attachContent = useCallback((element: HTMLDivElement | null) => {
    setTocHeadings(element ? collectTocHeadings(element) : []);
    if (element) setTocOpened(false);
  }, []);
  const projectLinks = useMemo(() => getProjectLinks(packageJSON), [packageJSON]);
  const version = formatPackageVersion(packageJSON);
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
    document.documentElement.lang = locale;
    void i18n.changeLanguage(locale);
  }, [i18n, locale]);

  useEffect(() => {
    document.title = formatDocumentTitle(pageTitle, title, packageJSON);
  }, [packageJSON, pageTitle, title]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpened(true);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  function changeLocale(nextLocale: string) {
    // Keep the reader on the same route when it exists in the next locale.
    const nextRoute =
      routes.find((item) => item.path === route?.path && item.locale === nextLocale) ??
      routes.find((item) => item.locale === nextLocale);
    if (!nextRoute) return;
    const url = new URL(location.href);
    url.searchParams.delete('lang');
    navigate(`${nextRoute.pathname}${url.search}${url.hash}`);
  }

  function handleContentClick(event: MouseEvent<HTMLElement>) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const anchor = (event.target as HTMLElement).closest('a');
    if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('#')) return;
    const url = new URL(anchor.href, location.href);
    if (url.origin !== location.origin) return;
    const routePath = stripBasePath(url.pathname, basePath);
    if (routeIndex[routePath] === undefined) return;
    event.preventDefault();
    navigate(`${routePath}${url.search}${url.hash}`);
  }

  const drawerContent = (
    <Box sx={{ width: 280 }} role='presentation'>
      <Typography
        variant='overline'
        color='text.secondary'
        sx={{ display: 'block', px: 2, pt: 2, pb: 1 }}
      >
        {t('navigation')}
      </Typography>
      <Divider />
      <List component='nav' aria-label={t('navigation')} sx={{ py: 1 }}>
        {navigation}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <GlobalStyles
        styles={{
          '.vited-material-content :is(h1, h2, h3, h4, h5, h6)': { scrollMarginTop: '80px' },
          '.vited-heading-anchor': {
            marginInlineStart: '0.35em',
            color: 'inherit',
            textDecoration: 'none',
            opacity: 0,
            transition: 'opacity 0.15s ease-in-out',
          },
          '.vited-material-content :is(h1, h2, h3, h4, h5, h6):hover .vited-heading-anchor, .vited-heading-anchor:focus-visible':
            {
              opacity: 0.6,
            },
          '@media (hover: none)': {
            '.vited-heading-anchor': { opacity: 0.6 },
          },
        }}
      />
      <AppBar position='sticky' color='default' elevation={1}>
        <Toolbar sx={{ gap: { xs: 0.5, sm: 1 }, flexWrap: 'nowrap' }}>
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
          <Stack spacing={0} sx={{ minWidth: 0, flex: '0 1 auto', overflow: 'hidden' }}>
            <Typography variant='subtitle1' fontWeight={700} noWrap>
              {title || 'Documentation'}
              {version ? (
                <Typography
                  component='span'
                  variant='caption'
                  color='text.secondary'
                  sx={{ fontWeight: 400 }}
                >
                  {' '}
                  {version}
                </Typography>
              ) : undefined}
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
            sx={{ ml: 'auto', flexWrap: 'nowrap', flexShrink: 0 }}
          >
            {searchIndex.length > 0 ? (
              <>
                <IconButton
                  color='inherit'
                  onClick={() => setSearchOpened(true)}
                  aria-label={`${t('search')} ${getSearchShortcut()}`}
                  sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                >
                  <SearchIcon />
                </IconButton>
                <ButtonBase
                  onClick={() => setSearchOpened(true)}
                  aria-label={`${t('search')} ${getSearchShortcut()}`}
                  aria-haspopup='dialog'
                  sx={{
                    display: { xs: 'none', sm: 'flex' },
                    alignItems: 'center',
                    gap: 1,
                    width: { sm: 200, md: 280 },
                    height: 40,
                    px: 2,
                    backgroundColor: 'action.hover',
                    color: 'text.secondary',
                    '&:hover': { backgroundColor: 'action.selected' },
                    '&:focus-visible': {
                      outline: '2px solid',
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <SearchIcon fontSize='small' />
                  <Typography variant='body2' sx={{ flexGrow: 1, textAlign: 'start' }}>
                    {t('search')}
                  </Typography>
                  <Typography variant='caption' sx={{ whiteSpace: 'nowrap' }}>
                    {getSearchShortcut()}
                  </Typography>
                </ButtonBase>
              </>
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
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
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
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  <FavoriteIcon sx={{ color: 'error.main' }} />
                </IconButton>
              </Tooltip>
            ) : undefined}
            {locales.length > 1 ? (
              <>
                <Button
                  color='inherit'
                  aria-label={t('language')}
                  aria-haspopup='menu'
                  aria-expanded={Boolean(languageMenu)}
                  startIcon={<LanguageIcon fontSize='small' />}
                  endIcon={<ArrowDropDownIcon />}
                  onClick={(event) => setLanguageMenu(event.currentTarget)}
                  sx={{
                    minWidth: 0,
                    px: { xs: 1, sm: 1.5 },
                    borderRadius: '4px',
                    fontWeight: 400,
                    textTransform: 'none',
                    '& .MuiButton-startIcon': { display: { xs: 'none', sm: 'inline-flex' } },
                  }}
                >
                  {new Intl.DisplayNames([locale], { type: 'language' }).of(locale) ?? locale}
                </Button>
                <Menu
                  anchorEl={languageMenu}
                  open={Boolean(languageMenu)}
                  onClose={() => setLanguageMenu(undefined)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  {locales.map((item) => (
                    <MenuItem
                      key={item}
                      selected={item === locale}
                      onClick={() => {
                        changeLocale(item);
                        setLanguageMenu(undefined);
                      }}
                    >
                      {new Intl.DisplayNames([item], { type: 'language' }).of(item) ?? item}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            ) : undefined}
            <ColorSchemeToggle scheme={colorScheme} onToggle={onToggleColorScheme} />
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ display: 'flex', flexGrow: 1, minHeight: 0 }}>
        {showNavigation && isDesktop ? (
          <Box
            component='aside'
            sx={{
              width: 280,
              flexShrink: 0,
              borderRight: 1,
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                position: 'sticky',
                top: 64,
                height: 'calc(100vh - 64px)',
                overflowY: 'auto',
              }}
            >
              {drawerContent}
            </Box>
          </Box>
        ) : undefined}

        <Box component='main' sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              maxWidth: 1440,
              mx: 'auto',
              pl: { lg: 3 },
            }}
          >
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Container maxWidth='lg' sx={{ py: 3 }}>
                <ScrollRestore key={pathname} />
                {Content ? (
                  <Box
                    className='vited-material-content'
                    onClick={handleContentClick}
                    key={pathname}
                    ref={attachContent}
                  >
                    <Content components={markdownComponents} />
                  </Box>
                ) : (
                  <Typography color='text.secondary'>{t('noDocuments')}</Typography>
                )}
              </Container>
            </Box>
            <Box
              component='aside'
              aria-hidden={tocHeadings.length > 0 ? undefined : true}
              sx={{ display: { xs: 'none', lg: 'block' }, width: 280, flexShrink: 0, pr: 3 }}
            >
              <Box
                sx={{
                  position: 'sticky',
                  top: 88,
                  maxHeight: 'calc(100vh - 104px)',
                  overflowY: 'auto',
                  py: 3,
                }}
              >
                {tocHeadings.length > 0 ? (
                  <>
                    <Typography
                      variant='overline'
                      color='text.secondary'
                      sx={{ display: 'block', mb: 1 }}
                    >
                      {t('tableOfContents')}
                    </Typography>
                    <TocTree
                      headings={tocHeadings}
                      activeId={activeHeadingId}
                      ariaLabel={t('tableOfContents')}
                    />
                  </>
                ) : undefined}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

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

      {tocHeadings.length > 0 ? (
        <>
          <Fab
            color='primary'
            aria-label={tocOpened ? t('closeTableOfContents') : t('openTableOfContents')}
            aria-expanded={tocOpened}
            onClick={() => setTocOpened((opened) => !opened)}
            sx={{
              position: 'fixed',
              right: 16,
              bottom: 16,
              display: { xs: 'flex', lg: 'none' },
              zIndex: (theme) => theme.zIndex.drawer - 1,
            }}
          >
            <TocIcon />
          </Fab>
          <Drawer
            variant='temporary'
            anchor='right'
            open={tocOpened}
            onClose={() => setTocOpened(false)}
            sx={{ display: { xs: 'block', lg: 'none' }, '& .MuiDrawer-paper': { width: 300 } }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant='overline'
                color='text.secondary'
                sx={{ display: 'block', mb: 1 }}
              >
                {t('tableOfContents')}
              </Typography>
              <TocTree
                headings={tocHeadings}
                activeId={activeHeadingId}
                ariaLabel={t('tableOfContents')}
                onNavigate={() => setTocOpened(false)}
              />
            </Box>
          </Drawer>
        </>
      ) : undefined}

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

function getSearchShortcut(): string {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform)
    ? '⌘K'
    : 'Ctrl+K';
}

function stripBasePath(pathname: string, basePath: string): string {
  const base = basePath.replace(/\/$/, '');
  if (!base) return pathname;
  if (pathname === base) return '/';
  return pathname.startsWith(`${base}/`) ? pathname.slice(base.length) : pathname;
}
