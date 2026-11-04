import { defineConfig } from 'oxlint';
import recommended from 'oxlint-config-recommended';
import recommendedJsxA11y from 'oxlint-config-recommended/jsx-a11y';
import recommendedReact from 'oxlint-config-recommended/react';

export default defineConfig({
  env: { builtin: true, browser: true, node: true, vitest: true },
  extends: [recommended, recommendedReact, recommendedJsxA11y],
});
