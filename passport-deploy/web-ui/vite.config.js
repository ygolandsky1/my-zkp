import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This plugin injects all the necessary Node.js polyfills for browser compatibility.
    nodePolyfills({
      // Options to specifically include/exclude certain polyfills if needed.
      // For this PoC, the defaults are likely sufficient.
      protocolImports: true,
    }),
  ],
  define: {
    // Some libraries use 'global' which needs to be polyfilled in the browser.
    'global': 'globalThis'
  }
})

