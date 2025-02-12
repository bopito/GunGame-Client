import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
    base: command === "serve" ? "/" : "/GunGame-Client/",
    server: {
        port: 5173,
        strictPort: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Security-Policy":
                "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " +  // ✅ Allows Base64, blob URLs
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "connect-src 'self' ws://192.168.1.108:8080 wss://your-server.com; " +
                "img-src 'self' data: blob:; " +  // ✅ Fully allows Base64 images
                "worker-src 'self' blob:;"
        }
    },
    build: {
        outDir: "dist"
    }
}));
