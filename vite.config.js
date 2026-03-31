import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      mode:'generateSW',
      registerType: 'autoUpdate', // Automatically updates the service worker
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      workbox: {
        globDirectory: 'dist',
        globPatterns: ['**/*.{js,css,html,wasm}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
      },
      devOptions: {
        enabled: true, // Enable PWA features during development
      },
      manifest: {
        name: 'SpendWithMe',
        short_name: 'SpendWithMe',
        description: 'Take Control of Your Financial Future',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: './web-app-manifest-192x192.png', // You’ll create this icon in Step 4
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './web-app-manifest-512x512.png', // You’ll create this icon in Step 4
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
});