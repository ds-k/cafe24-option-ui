import { defineConfig } from "vite";

export default defineConfig({
  build: {
    assetsInlineLimit: 100000000,
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
      },
    },
  },
});
