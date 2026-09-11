/**
 * React Router `basename` for the current deployment.
 *
 * Vite exposes the configured `base` as `import.meta.env.BASE_URL`, always with
 * a trailing slash ("/" in development, "/strings-of-heaven/" on GitHub Pages).
 * React Router expects a basename without it, and "" for a root deployment.
 *
 * Without this, the app mounted at a Pages sub-path sees "/strings-of-heaven/"
 * as a route, matches nothing, and redirects to "/" — leaving the site.
 */
export function routerBasename(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, '');
}

export default routerBasename;
