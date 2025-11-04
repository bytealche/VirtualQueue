import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import restart from 'vite-plugin-restart'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
  plugins: [
    react(),
    glsl(), // Support GLSL files
    restart({ restart: ['static/**'] }) // Restart server on static file change
  ],
  base: '/VirtualQueue', // 👈 Use your repo name here
  
  // 1. We remove `root: 'src/'` to use the default (Frontend/)
  
  // 2. We make `publicDir` relative to the default root
  publicDir: 'static/', // Path from root to static assets
  
  server:
  {
    host: true, // Open to local network and display URL
    open: !('SANDBOX_URL' in process.env || 'CODESANDBOX_HOST' in process.env) // Open if it's not a CodeSandbox
  },
  build:
  {
    // 3. We make `outDir` relative to the default root
    outDir: 'dist', // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: true // Add sourcemap
  }
})