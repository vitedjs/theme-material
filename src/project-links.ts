export interface ProjectLinks {
  github?: string;
  funding?: string;
}

export function getProjectLinks(packageJSON: Record<string, unknown> = {}): ProjectLinks {
  return {
    github: getGitHubRepositoryUrl(packageJSON.repository),
    funding: getFundingUrl(packageJSON.funding),
  };
}

function getGitHubRepositoryUrl(repository: unknown): string | undefined {
  let repositoryUrl: string | undefined;
  if (typeof repository === 'string') {
    repositoryUrl = repository;
  } else if (isRecord(repository) && typeof repository.url === 'string') {
    repositoryUrl = repository.url;
  }
  if (!repositoryUrl) return undefined;

  let normalized = repositoryUrl.trim().replace(/^git\+/, '');
  const shorthand = normalized.match(/^github:([^/]+\/[^/]+)$/i);
  if (shorthand) normalized = `https://github.com/${shorthand[1]}`;
  const ssh = normalized.match(/^(?:git@github\.com:|ssh:\/\/git@github\.com\/)([^/]+\/[^/]+)$/i);
  if (ssh) normalized = `https://github.com/${ssh[1]}`;

  try {
    const url = new globalThis.URL(normalized);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined;
    if (url.hostname.toLowerCase() !== 'github.com') return undefined;
    const [owner, repositoryName] = url.pathname.split('/').filter(Boolean);
    if (!owner || !repositoryName) return undefined;
    return `https://github.com/${owner}/${repositoryName.replace(/\.git$/i, '')}`;
  } catch {
    return undefined;
  }
}

function getFundingUrl(funding: unknown): string | undefined {
  if (Array.isArray(funding)) {
    for (const entry of funding) {
      const url = getFundingUrl(entry);
      if (url) return url;
    }
    return undefined;
  }

  let value: string | undefined;
  if (typeof funding === 'string') {
    value = funding;
  } else if (isRecord(funding) && typeof funding.url === 'string') {
    value = funding.url;
  }
  if (!value) return undefined;

  try {
    const url = new globalThis.URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : undefined;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
