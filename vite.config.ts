import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png', '.well-known/assetlinks.json'],
      manifest: {
        name: 'Dota 2 Counter Picker',
        short_name: 'D2Picker',
        description: 'Free Dota 2 counter picker — instant hero recommendations from pro match data',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: '/icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        runtimeCaching: [
          {
            // Hero images from Steam CDN
            urlPattern: /^https:\/\/cdn\.cloudflare\.steamstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hero-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            // Matchups lazy chunk — stale-while-revalidate (updates weekly)
            urlPattern: /all_matchups.*\.js$/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'matchup-data' },
          },
        ],
      },
    }),
  ],
})
