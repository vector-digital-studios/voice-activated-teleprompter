import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  // Relative asset URLs so dist/ works from any sub-path (e.g. GitHub Pages /dist/)
  base: "./",
  plugins: [react()],
  server: {
    open: true,
  },
  resolve: {
    alias: {
      bulma: resolve(__dirname, "node_modules/bulma/bulma.sass"),
    },
  },
})
