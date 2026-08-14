import { execSync } from "child_process"
import { describe, it, expect } from "vitest"

describe("build", () => {
  it("next build succeeds", () => {
    expect(() => {
      execSync("npx next build", {
        cwd: process.cwd(),
        stdio: "pipe",
        timeout: 120_000,
      })
    }).not.toThrow()
  }, 120_000)
})
