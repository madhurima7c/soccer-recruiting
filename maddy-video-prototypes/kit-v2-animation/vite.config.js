import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  server: { port: 3002, open: true },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        export: resolve(__dirname, "export.html"),
      },
    },
  },
});
