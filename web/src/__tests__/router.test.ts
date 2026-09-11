import { describe, expect, it } from 'vitest';
import { routerBasename } from '../router';

describe('routerBasename', () => {
  it('strips the trailing slash from a GitHub Pages project base path', () => {
    expect(routerBasename('/strings-of-heaven/')).toBe('/strings-of-heaven');
  });

  it('returns an empty basename for a root deployment', () => {
    expect(routerBasename('/')).toBe('');
  });

  it('supports a custom nested base path', () => {
    expect(routerBasename('/custom-path/')).toBe('/custom-path');
  });

  it('tolerates a base path without a trailing slash', () => {
    expect(routerBasename('/repo')).toBe('/repo');
  });
});
