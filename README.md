# @vited/theme-material

The Material UI theme for Vited. It renders generated document pages with
MUI components, provides responsive navigation in an app bar and drawer, and
includes a persisted light/dark theme toggle with Material icons. Interface
labels are available in English and Simplified Chinese; the language selector
appears when multiple locales are configured. These labels use `react-i18next`
resources in [`src/i18n.ts`](./src/i18n.ts). When supplied with Vited's generated
search index, it provides locale-aware fuzzy search in a dialog, opened with the
Search button or `Ctrl+K` / `⌘K`. GitHub and Donate links are shown in the app
bar when the supplied `packageJSON` includes valid `repository` and `funding`
URLs. The documentation favicon discovered by Vited is displayed to the left of
the app bar title. Markdown and MDX fenced code blocks use Shiki syntax
highlighting, with copy controls and translated copy labels. Markdown and MDX headings show an anchor link on hover, and the page outline is shown in a table of contents on the right of the content; on small screens it opens from a floating button.

```ts
import { defineConfig } from '@vited/core';

export default defineConfig({
  docs: {
    title: 'My Cool Library',
    supportedLocales: ['en', 'zh'],
    theme: '@vited/theme-material',
  },
});
```

The theme is loaded by Vited's generated client; applications don't need to
render it manually. Material UI follows the system color scheme by default and
remembers the user's theme selection.
