import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import {VitePWA} from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        VitePWA({
            base: '/',
            registerType: 'autoUpdate',
            includeAssets: ['favicon.png',
                'favicon.ico',
                'robots.txt',
                'apple-touch-icon.png',
                'thirtytwo-9-82-180.png',
                'vips.js',
                'vips.wasm',
                'vips.worker.js'
            ],
            manifest: {
                name: 'Unreal Mapbox Bridge',
                short_name: 'Unreal Mapbox Bridge',
                description: 'Use real world terrain data to create heightmaps for unreal engine',
                theme_color: '#ffffff',
                workbox: {
                    cleanupOutdatedCaches: true,
                      },
                icons: [
                    {
                        src: 'pwa-192x192.png', // <== don't add slash, for testing
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png', // <== don't remove slash, for testing
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png', // <== don't add slash, for testing
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            }
        }),
        vue()
    ],
    define: {
        'process.env': {}
    }
})
