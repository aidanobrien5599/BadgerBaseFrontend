import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    // Component tests opt into jsdom per-file with a
    // `// @vitest-environment jsdom` docblock. The default stays node so the
    // existing file-reading tests (build, tokens, colors) are unaffected.
    include: ["__tests__/**/*.test.{ts,tsx}"],
    setupFiles: ["./__tests__/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
