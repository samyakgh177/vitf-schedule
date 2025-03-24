import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Add Firebase specific aliases
      "firebase/app": path.resolve(__dirname, "node_modules/firebase/app"),
      "firebase/auth": path.resolve(__dirname, "node_modules/firebase/auth"),
      "firebase/firestore": path.resolve(__dirname, "node_modules/firebase/firestore"),
      "firebase/storage": path.resolve(__dirname, "node_modules/firebase/storage")
    }
  },
  // Optimize dependencies for better build performance
  optimizeDeps: {
    // Exclude firebase from optimizeDeps to prevent resolution issues
    exclude: ['firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
  },
  build: {
    commonjsOptions: {
      // These options help with CommonJS modules like Firebase
      transformMixedEsModules: true,
      include: [/node_modules/]
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Group Firebase packages together
          if (id.includes('firebase')) {
            return 'vendor-firebase';
          }
          
          // Group React packages together
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
            return 'vendor-react';
          }
          
          // Group UI components
          if (id.includes('@/components/ui/')) {
            return 'ui-components';
          }
          
          // Group feature components
          if (id.includes('@/components/timetable/')) {
            return 'feature-timetable';
          }
          
          if (id.includes('@/components/substitution/')) {
            return 'feature-substitution';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
