import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    alias: {
      'react-is': 'react-is/cjs/react-is.production.js'
    }
  },
  plugins: [
    react(),
    VitePWA({

      registerType: 'autoUpdate',
      manifest: {
        name: 'RailGuard AI',
        short_name: 'RailGuard',
        description: 'AI-Powered Railway Fleet & Track Triage System',
        theme_color: '#0f172a',
        background_color: '#020617',
        display: 'standalone',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  server: {
    port: 5173,
  },
});
