import { defineConfig } from '@vited/core';

export default defineConfig({
  base: '/theme-material/',
  server: {
    open: true,
  },
  docs: {
    title: 'Vited Material Theme',
    supportedLocales: ['en', 'zh'],
    theme: '@vited/theme-material',
  },
});
