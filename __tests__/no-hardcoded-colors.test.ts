import { execSync } from "child_process"
import { describe, it, expect } from "vitest"

const MIGRATED_FILES = [
  "app/layout.tsx",
  "components/navigation.tsx",
  "components/footer.tsx",
  "components/auth-button.tsx",
  "components/maintenance-banner.tsx",
]

describe("no hardcoded colors in migrated files", () => {
  MIGRATED_FILES.forEach((file) => {
    it(`${file} has no hardcoded color classes`, () => {
      let result = ""
      try {
        result = execSync(
          `grep -nE '(bg|text|border|ring)-(gray|red|white|black|blue|green|orange|purple|pink|yellow)-[0-9]' ${file}`,
          { cwd: process.cwd(), encoding: "utf-8" }
        )
      } catch (error: any) {
        // grep exits with status 1 when there are no matches — that's the
        // success case, so leave `result` empty. Any other failure (e.g. the
        // file doesn't exist) should surface as a real test error.
        if (error.status !== 1) {
          throw error
        }
      }
      // Asserting outside the try/catch ensures a real match failure isn't
      // accidentally swallowed by the catch block above.
      expect(result.trim()).toBe("")
    })
  })
})
