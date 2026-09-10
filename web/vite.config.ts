import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
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

export default defineConfig({
  plugins: [react()],
  
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
