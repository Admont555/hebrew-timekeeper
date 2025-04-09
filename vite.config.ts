
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Removed the componentTagger plugin that was causing issues
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
}));
