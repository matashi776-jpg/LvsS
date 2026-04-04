import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        rollupOptions: {
            output: {
                // Split Phaser into its own chunk to speed up rebuilds
                manualChunks: { phaser: ['phaser'] }
            }
        }
    },
    server: { port: 3000, open: true }
});
