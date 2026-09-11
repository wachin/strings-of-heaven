import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Get base path for GitHub Pages deployment
 * Repository name is extracted from GITHUB_REPOSITORY environment variable
 * or can be set manually via VITE_BASE_PATH
 */
function getBasePath(): string {
  // Manual override
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }
  
  // GitHub Pages automatic detection
  if (process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1];
    return `/${repoName}/`;
  }
  
  // Local development or custom deployment
  return '/';
}

/**
 * GitHub Pages has no SPA rewrite: any path that is not a real file returns a
 * 404. Copying the built index.html to 404.html makes deep links such as
 * /song/<id> boot the app at the requested URL (the client-side router then
 * resolves it) instead of showing the Pages 404 page.
 *
 * This is base-path agnostic: the copy keeps the same absolute asset URLs as
 * index.html, so it works at "/" and at "/<repo>/" alike.
 */
function spaFallback(): Plugin {
  return {
    name: 'soh-spa-fallback',
    apply: 'build',
    closeBundle() {
      const dist = path.resolve(__dirname, 'dist');
      const index = path.join(dist, 'index.html');
      if (!fs.existsSync(index)) return;
      fs.copyFileSync(index, path.join(dist, '404.html'));
      // Serve the published artifact as-is, without Jekyll processing.
      fs.writeFileSync(path.join(dist, '.nojekyll'), '');
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  
  // GitHub Pages base path configuration
  base: getBasePath(),
  
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
  
  server: {
    fs: {
      allow: [path.resolve(__dirname), path.resolve(__dirname, '..')],
    },
  },
  
  // Build configuration for GitHub Pages
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure proper asset paths for GitHub Pages
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          vendor: ['react', 'react-dom'],
          ui: ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
  
  // Define environment variables
  define: {
    // Pass base path to the application
    __VITE_BASE_PATH__: JSON.stringify(getBasePath()),
  },
  
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
