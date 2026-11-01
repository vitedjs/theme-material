import preset from '@guoyunhe/oxfmt-config';
import { defineConfig } from 'oxfmt';

export default defineConfig({
  ...preset,
  // The sample docs are a submodule with its own formatting conventions.
  ignorePatterns: [...preset.ignorePatterns, 'docs_dist', 'docs/sample'],
});
