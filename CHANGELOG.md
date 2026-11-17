# Changelog

## 0.3.3 - 2026-11-17

### Fixed

- Restore the scroll position on every navigation with `react-scroll-restore` 0.2.0 by mounting the restore boundary in the page area.

## 0.3.2 - 2026-11-15

### Fixed

- Restore the scroll position on navigation with `react-scroll-restore` 0.1.1: hash targets stay below the sticky header and pages without a hash return to the top.

## 0.3.1 - 2026-11-15

### Changed

- Require `@vited/core` 0.6 or newer as a peer dependency.

## 0.3.0 - 2026-11-15

### Added

- Show the `version` from the project's `package.json` in the app bar, in small muted text after the title.

## 0.2.0 - 2026-11-15

### Added

- Set the browser tab title for each page from the page title and the site title.

### Changed

- Require `@vited/core` 0.5 or newer as a peer dependency.

### Fixed

- Highlight code blocks with the Shiki theme that matches the active color scheme, so code colors follow light and dark mode.

## 0.1.2 - 2026-11-05

### Added

- Show `new` and `deprecated` badges from page frontmatter in the generated sidebar.

### Fixed

- Allow sidebar parent items to expand their nested pages while navigating.

## 0.1.1 - 2026-11-02

### Added

- Show an anchor link when hovering a Markdown or MDX heading, and list the page outline in a table of contents that stays in view while scrolling. On small screens the outline opens from a floating action button.

### Changed

- Match the table of contents column width to the navigation sidebar, keeping the article centered on wide screens.

## 0.1.0 - 2026-10-31

Initial release.

### Added

- Responsive documentation layout with Material UI app bar and drawer navigation.
- English and Simplified Chinese interface translations, localized routes, and a light/dark theme toggle.
- Locale-aware fuzzy search with a dialog and the `Ctrl+K` / `⌘K` shortcut.
- Optional GitHub and Donate links from project metadata.
- Markdown and MDX code blocks highlighted with Shiki, including copy controls.
