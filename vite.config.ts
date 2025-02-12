import { defineConfig } from "vite";

export default defineConfig(({ command }) => {
    return {
        base: command === "serve" ? "/" : "/GunGame-Client/", 
        server: {
            port: 8080,
            strictPort: true,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; worker-src 'self' blob:; img-src 'self' data:;"
            }
        },
        build: {
            outDir: "dist"
        }
    };
});
