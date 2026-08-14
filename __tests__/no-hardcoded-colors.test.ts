import { execSync } from "child_process"
import { describe, it, expect } from "vitest"

const MIGRATED_FILES = [
  "app/layout.tsx",
  "components/navigation.tsx",
  "components/footer.tsx",
  "components/auth-button.tsx",
  "components/maintenance-banner.tsx",
  "components/course-table.tsx",
  "components/course-header.tsx",
  "components/availability-calendar.tsx",
  "components/sections/SectionDetails.tsx",
  "components/sections/LectureRow.tsx",
  "components/sections/HierarchicalSections.tsx",
  "app/login/page.tsx",
  "app/signup/page.tsx",
  "app/dashboard/page.tsx",
  "components/login-dialog.tsx",
  "components/notification-button.tsx",
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

  it("course-table.tsx has no inline hex color values", () => {
    let result = ""
    try {
      result = execSync(
        `grep -nE 'fill: "#[0-9a-fA-F]' components/course-table.tsx`,
        { cwd: process.cwd(), encoding: "utf-8" }
      )
    } catch (error: any) {
      if (error.status !== 1) {
        throw error
      }
    }
    expect(result.trim()).toBe("")
  })

  it("course-table.tsx has no inline fontSize values", () => {
    let result = ""
    try {
      result = execSync(
        `grep -nE 'fontSize: [0-9]' components/course-table.tsx`,
        { cwd: process.cwd(), encoding: "utf-8" }
      )
    } catch (error: any) {
      if (error.status !== 1) {
        throw error
      }
    }
    expect(result.trim()).toBe("")
  })
})
