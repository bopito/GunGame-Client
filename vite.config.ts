import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  server: {
    headers: {
        "Content-Security-Policy": "script-src 'self' 'unsafe-eval'"
    },
    port: 8080,
    open: true,
    watch: {
        usePolling: true
    }
  }
    
});
