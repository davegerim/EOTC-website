import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                works: resolve(__dirname, 'works.html'),
                heritage: resolve(__dirname, 'heritage.html'),
            },
        },
    },
});
