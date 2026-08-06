import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { fileURLToPath } from "node:url"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(rootDir, "index.html"),
        desktop: path.resolve(rootDir, "desktop/index.html"),
        depth: path.resolve(rootDir, "depth/index.html"),
      },
    },
  },
  server: {
    // Make /desktop resolve to the multi-page entry in dev
    open: false,
  },
})
