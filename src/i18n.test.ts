import { describe, expect, it } from 'vitest';

import { themeI18n } from './i18n';

describe('theme translations', () => {
  it('switches internal interface text with the document locale', async () => {
    await themeI18n.changeLanguage('zh');
    expect(themeI18n.t('search')).toBe('搜索');
    expect(themeI18n.t('navigation')).toBe('导航');

    await themeI18n.changeLanguage('en');
    expect(themeI18n.t('search')).toBe('Search');
    expect(themeI18n.t('navigation')).toBe('Navigation');
  });

  it('uses the Chinese resources for regional Chinese locales', async () => {
    await themeI18n.changeLanguage('zh-CN');
    expect(themeI18n.t('searchPlaceholder')).toBe('搜索文档');
    await themeI18n.changeLanguage('en');
  });
});
