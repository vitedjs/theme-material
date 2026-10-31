import Fuse from 'fuse.js';

export interface SearchDocument {
  /** Path matched by the client router, e.g. `/zh/guide/start/`. */
  pathname: string;
  locale: string;
  title: string;
  content: string;
}

export function createPageSearch(documents: SearchDocument[]): (query: string) => SearchDocument[] {
  const indexedDocuments = documents.map((document) => ({
    document,
    cjkContent: `${document.title}${document.content}`.replaceAll(
      /[^\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu,
      '',
    ),
  }));
  const fuse = new Fuse(indexedDocuments, {
    keys: [
      { name: 'document.title', weight: 2 },
      { name: 'document.content', weight: 1 },
      { name: 'cjkContent', weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });

  return (query) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return documents;

    const searchOptions =
      /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u.test(trimmedQuery)
        ? { keys: ['cjkContent'] }
        : undefined;
    return fuse.search(trimmedQuery, searchOptions).map(({ item }) => item.document);
  };
}
