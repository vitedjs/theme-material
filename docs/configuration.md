---
title: Configuration
order: 20
---

# Configuration

The theme is configured through the `docs` option of
[Vited Core](https://github.com/vitedjs/core); there are no theme-specific
options.

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    title: 'My Cool Library',
    description: 'Documentation for My Cool Library',
    supportedLocales: ['en', 'zh'],
    theme: '@vited/theme-material',
  },
});
```

## Title, description and favicon

`title` and `description` appear in the app bar, next to the favicon that Vited
discovers from your docs directory.

## Locales

When `supportedLocales` lists more than one locale, a language selector appears
in the app bar and the interface labels (search, navigation, color mode toggle)
switch between the bundled English and Simplified Chinese translations.

## Search

The search dialog indexes the title and content of every page in the current
locale and supports fuzzy matching, including Chinese text. Open it with the
Search button or `Ctrl+K` / `⌘K`, move through results with the arrow keys, and
confirm with `Enter`.

## Color modes

The theme follows the system color scheme until the user picks light or dark
with the app bar toggle. The explicit choice is persisted in `localStorage` and
applied through MUI's theme palette, so all Material UI components adapt
automatically.

## Project links

When the `package.json` passed to the theme contains a GitHub `repository` URL
or a `funding` URL, the corresponding links are shown as icon buttons in the
app bar.

## Code highlighting

Fenced code blocks are highlighted with Shiki using the GitHub light and dark
themes. Preloaded languages: `bash`, `css`, `diff`, `html`, `javascript`,
`json`, `jsx`, `markdown`, `mdx`, `shellscript`, `typescript`, `tsx` and
`yaml`; other languages fall back to plain text.
