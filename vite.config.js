import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
// import wasmPack from 'vite-plugin-wasm-pack';
// import { VitePWA } from "vite-plugin-pwa"
// https://vitejs.dev/config/
// wasmPack(['./crate'], ['crate'])
//Response headears are used to support wasm that uses the Shared Array Buffer
export default defineConfig({
    plugins: [
        vue(),
        {
            name: "configure-response-headers",
            configureServer: (server) => {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    next();
                });
            }
        }
    ],
    define: {
        'process.env': {}
    },
})
