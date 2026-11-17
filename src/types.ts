import type { ComponentType, ReactNode } from 'react';

import type { SearchDocument } from './search';

export interface MarkdownElementProps {
  children?: ReactNode;
  html?: string;
}

export type MarkdownComponents = Record<string, ComponentType<MarkdownElementProps>>;

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

export type ColorScheme = 'light' | 'dark';
