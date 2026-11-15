/** Formats the package version for the header, e.g. `1.2.3` becomes `v1.2.3`. */
export function formatPackageVersion(packageJSON: Record<string, unknown> = {}): string {
  const version = typeof packageJSON['version'] === 'string' ? packageJSON['version'].trim() : '';
  if (!version) return '';
  return version.startsWith('v') ? version : `v${version}`;
}
