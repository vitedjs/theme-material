import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export const themeI18n = i18n.createInstance();

void themeI18n.use(initReactI18next).init({
  fallbackLng: 'en',
  supportedLngs: ['en', 'zh'],
  load: 'languageOnly',
  resources: {
    en: {
      translation: {
        language: 'Language',
        navigation: 'Navigation',
        tableOfContents: 'On this page',
        openTableOfContents: 'Open table of contents',
        closeTableOfContents: 'Close table of contents',
        noDocuments: 'No documents were found in the configured docs directory.',
        openNavigation: 'Open navigation',
        closeNavigation: 'Close navigation',
        switchToLight: 'Switch to light mode',
        switchToDark: 'Switch to dark mode',
        search: 'Search',
        searchPlaceholder: 'Search documentation',
        noSearchResults: 'No matching documents found',
        close: 'Close',
        github: 'GitHub',
        donate: 'Donate',
        copy: 'Copy',
        copied: 'Copied',
      },
    },
    zh: {
      translation: {
        language: '语言',
        navigation: '导航',
        tableOfContents: '本页目录',
        openTableOfContents: '打开目录',
        closeTableOfContents: '关闭目录',
        noDocuments: '在配置的文档目录中没有找到文档。',
        openNavigation: '打开导航',
        closeNavigation: '关闭导航',
        switchToLight: '切换到浅色模式',
        switchToDark: '切换到深色模式',
        search: '搜索',
        searchPlaceholder: '搜索文档',
        noSearchResults: '没有找到匹配的文档',
        close: '关闭',
        github: 'GitHub',
        donate: '赞助',
        copy: '复制',
        copied: '已复制',
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
  initImmediate: false,
});
