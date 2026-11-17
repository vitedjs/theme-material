import { createHighlighter, type BundledLanguage } from 'shiki';

const highlightLanguages: BundledLanguage[] = [
  'bash',
  'css',
  'diff',
  'html',
  'javascript',
  'json',
  'jsx',
  'markdown',
  'mdx',
  'shellscript',
  'typescript',
  'tsx',
  'yaml',
];

let highlighterPromise: ReturnType<typeof createHighlighter> | undefined;

export function getHighlighter(): ReturnType<typeof createHighlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: highlightLanguages,
  });
  return highlighterPromise;
}
