import { describe, expect, it } from 'vitest';

import { createPageSearch } from './search';

describe('createPageSearch()', () => {
  const documents = [
    {
      pathname: '/guide/',
      locale: 'en',
      title: 'Getting started',
      content: 'Install the package.',
    },
    {
      pathname: '/api/',
      locale: 'en',
      title: 'API reference',
      content: 'Public methods and options.',
    },
  ];

  it('finds matching titles and body text with fuzzy search', () => {
    const search = createPageSearch(documents);

    expect(search('Geting start')).toEqual([documents[0]]);
    expect(search('Public methods')).toEqual([documents[1]]);
  });

  it('returns all documents for an empty query', () => {
    expect(createPageSearch(documents)('  ')).toEqual(documents);
  });

  it('matches Chinese phrases across punctuation and inline-code boundaries', () => {
    const chinesePage = {
      pathname: '/zh/guide/',
      locale: 'zh',
      title: '快速开始',
      content: '创建 docs 目录并添加 Markdown 文件。',
    };

    expect(createPageSearch([chinesePage])('创建目录')).toEqual([chinesePage]);
  });
});
