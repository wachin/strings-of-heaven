/**
 * Configuration and feature flags for Strings of Heaven
 * 
 * This file controls the application behavior for different deployment modes:
 * - Static mode (GitHub Pages): Uses localStorage for data persistence
 * - API mode (Server deployment): Uses backend API for data persistence
 */

export interface AppConfig {
  /** Whether to use API backend or static localStorage */
  useApiBackend: boolean;
  /** Base API URL when using backend mode */
  apiBaseUrl: string;
  /** GitHub Pages base path (empty for root deployment) */
  basePath: string;
  /** Enable debug logging */
  debug: boolean;
}

/**
 * Default configuration for GitHub Pages static deployment
 * 
 * To enable server mode for your fork:
 * 1. Set useApiBackend to true
 * 2. Update apiBaseUrl to your server endpoint
 * 3. Implement API endpoints matching the expected interface
 */
export const config: AppConfig = {
  // Static mode by default (GitHub Pages compatible)
  useApiBackend: false,
  
  // API base URL for server deployments
  // Example: 'https://your-server.com/api' or 'http://localhost:3001/api'
  apiBaseUrl: process.env.VITE_API_BASE_URL || '',
  
  // GitHub Pages base path (auto-configured in vite.config.ts)
  basePath: process.env.VITE_BASE_PATH || '',
  
  // Debug mode
  debug: process.env.NODE_ENV === 'development',
};

/**
 * Feature flags for different deployment scenarios
 */
export const features = {
  /** Enable song submission form */
  enableSongSubmission: true,
  
  /** Enable user authentication (requires API backend) */
  enableAuth: config.useApiBackend,
  
  /** Enable song sharing via URLs */
  enableSharing: true,
  
  /** Enable offline support */
  enableOffline: !config.useApiBackend,
  
  /** Enable chord transposition */
  enableTransposition: true,
  
  /** Enable autoscroll */
  enableAutoscroll: true,
} as const;

/**
 * Storage configuration
 */
export const storage = {
  /** LocalStorage keys */
  keys: {
    songs: 'strings-of-heaven-songs',
    userPreferences: 'strings-of-heaven-preferences',
    recentSongs: 'strings-of-heaven-recent',
  },
  
  /** Maximum songs to store in localStorage */
  maxLocalSongs: 1000,
  
  /** Maximum size per song in characters */
  maxSongSize: 50000,
} as const;

/**
 * API endpoints configuration (for server mode)
 */
export const apiEndpoints = {
  songs: '/songs',
  search: '/songs/search',
  upload: '/songs/upload',
  auth: '/auth',
  user: '/user',
} as const;

export default config;