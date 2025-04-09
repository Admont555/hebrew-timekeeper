
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Temporarily disabled componentTagger due to compatibility issues
    // mode === 'development' && componentTagger(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Ensure that we minimize correctly for mobile and desktop
    minify: 'terser',
    terserOptions: {
      compress: {
        // Avoid issues with mobile Safari
        drop_console: false,
        pure_funcs: ['console.debug']
      }
    }
  }
});
