import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
    base: command === "serve" ? "/" : "/GunGame-Client/",
    server: {
        port: 5173,
        strictPort: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Security-Policy":
                "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob:; " + 
                "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
                "connect-src 'self' ws://localhost:6969 wss://your-server.com; " +
                "img-src 'self' data: blob:; " +  
                "worker-src 'self' blob:;"
        }
    },
    build: {
        outDir: "dist"
    }
}));
