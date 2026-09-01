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
    // Route handlers read config from process.env. Vitest doesn't read the
    // repo's .env files automatically, so provide test-only values here.
    env: {
      API_URL: "https://api.example.com",
      SUBSCRIPTION_API_KEY: "test-key",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
