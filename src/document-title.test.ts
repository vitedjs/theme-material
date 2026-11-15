import { describe, expect, it } from 'vitest';

import { formatDocumentTitle } from './document-title';

describe('formatDocumentTitle()', () => {
  it('joins the page title and the site title with an en dash', () => {
    expect(formatDocumentTitle('Installation', 'Vited')).toBe('Installation – Vited');
  });

  it('falls back to the package name when there is no site title', () => {
    expect(formatDocumentTitle('Installation', '', { name: 'my-docs' })).toBe(
      'Installation – my-docs',
    );
  });

  it('does not repeat a page title that matches the site title', () => {
    expect(formatDocumentTitle('Vited', 'Vited')).toBe('Vited');
  });

  it('returns the site title when there is no page title', () => {
    expect(formatDocumentTitle('', 'Vited')).toBe('Vited');
  });
});
