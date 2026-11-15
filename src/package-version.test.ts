import { describe, expect, it } from 'vitest';

import { formatPackageVersion } from './package-version';

describe('formatPackageVersion()', () => {
  it('prefixes the package version with a lowercase v', () => {
    expect(formatPackageVersion({ version: '1.2.3' })).toBe('v1.2.3');
  });

  it('keeps an existing v prefix', () => {
    expect(formatPackageVersion({ version: 'v2.0.0' })).toBe('v2.0.0');
  });

  it('returns an empty string when the version is missing or invalid', () => {
    expect(formatPackageVersion({})).toBe('');
    expect(formatPackageVersion({ version: 3 })).toBe('');
    expect(formatPackageVersion({ version: '  ' })).toBe('');
  });
});
