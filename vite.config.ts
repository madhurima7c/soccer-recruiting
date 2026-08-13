import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import path from "node:path"
import { fileURLToPath } from "node:url"
import type { IncomingMessage, ServerResponse } from "node:http"

const rootDir = path.dirname(fileURLToPath(import.meta.url))

/** Netlify `_redirects` only apply in production — mirror them in Vite so /flow1 works locally. */
const DEV_REWRITES: Record<string, string> = {
  "/flow1": "/desktop-flow1/index.html",
  "/flow1/": "/desktop-flow1/index.html",
  "/desktop-flow1": "/desktop-flow1/index.html",
  "/flow2": "/desktop-flow2/index.html",
  "/flow2/": "/desktop-flow2/index.html",
  "/desktop-flow2": "/desktop-flow2/index.html",
  "/annotate": "/excel-annotate/index.html",
  "/annotate/": "/excel-annotate/index.html",
  "/excel-annotate": "/excel-annotate/index.html",
  "/desktop": "/desktop/index.html",
  "/depth": "/depth/index.html",
}

function spaPathRewrites(): Plugin {
  const rewrite = (
    req: IncomingMessage,
    _res: ServerResponse,
    next: () => void,
  ) => {
    const raw = req.url ?? "/"
    const pathOnly = raw.split("?")[0] ?? "/"
    const target = DEV_REWRITES[pathOnly]
    if (target) {
      const qs = raw.includes("?") ? raw.slice(raw.indexOf("?")) : ""
      req.url = `${target}${qs}`
    }
    next()
  }

  return {
    name: "spa-path-rewrites",
    configureServer(server) {
      server.middlewares.use(rewrite)
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewrite)
    },
  }
}

export default defineConfig({
  plugins: [spaPathRewrites(), react(), tailwindcss()],
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
        desktopFlow1: path.resolve(rootDir, "desktop-flow1/index.html"),
        desktopFlow2: path.resolve(rootDir, "desktop-flow2/index.html"),
        excelAnnotate: path.resolve(rootDir, "excel-annotate/index.html"),
        depth: path.resolve(rootDir, "depth/index.html"),
      },
    },
  },
  server: {
    open: false,
  },
})
