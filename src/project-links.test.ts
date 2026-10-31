import { describe, expect, it } from 'vitest';

import { getProjectLinks } from './project-links';

describe('getProjectLinks()', () => {
  it('resolves GitHub repository and funding URLs from package.json', () => {
    expect(
      getProjectLinks({
        repository: { type: 'git', url: 'git+https://github.com/vitedjs/core.git' },
        funding: { type: 'github', url: 'https://github.com/sponsors/vitedjs' },
      }),
    ).toEqual({
      github: 'https://github.com/vitedjs/core',
      funding: 'https://github.com/sponsors/vitedjs',
    });
  });

  it('supports GitHub shorthand, SSH URLs and funding arrays', () => {
    expect(
      getProjectLinks({
        repository: 'git@github.com:vitedjs/core.git',
        funding: [
          { type: 'invalid' },
          { type: 'opencollective', url: 'https://opencollective.com/vited' },
        ],
      }),
    ).toEqual({
      github: 'https://github.com/vitedjs/core',
      funding: 'https://opencollective.com/vited',
    });
  });

  it('omits unsupported or unsafe URLs', () => {
    expect(
      getProjectLinks({
        repository: 'https://example.com/vited/core',
        funding: 'javascript:alert(1)',
      }),
    ).toEqual({});
  });
});
