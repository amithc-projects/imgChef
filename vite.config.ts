import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext'
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      // CHANGED: 'require-corp' -> 'credentialless'
      // This allows loading external resources (like OSM Tiles) without them needing specific CORS headers,
      // while still enabling the SharedArrayBuffer needed for mp4-muxer.
      'Cross-Origin-Embedder-Policy': 'credentialless'
    }
  }
})