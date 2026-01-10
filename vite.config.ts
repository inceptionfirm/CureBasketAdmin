import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://java.api.curebasket.com/backend',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('❌ Proxy Error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Only log non-GET requests to reduce noise
            if (req.method !== 'GET') {
              console.log('📤 Proxy:', req.method, req.url, '→', 'https://java.api.curebasket.com/backend' + req.url);
            }
          });
          // Track logged 404s to avoid spam
          const logged404s = new Set<string>();
          
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // Only log 404 errors once per unique endpoint to reduce spam
            if (proxyRes.statusCode === 404) {
              const endpointKey = req.method + ' ' + req.url.split('?')[0];
              if (!logged404s.has(endpointKey)) {
                logged404s.add(endpointKey);
                console.log('📥 Proxy 404:', req.method, req.url, '(endpoint not found - will not log again)');
              }
            } else if (proxyRes.statusCode >= 400 && proxyRes.statusCode !== 404) {
              // Log other errors normally
              console.log('📥 Proxy Error:', proxyRes.statusCode, req.url);
            }
          });
        },
      },
    },
  },
})
