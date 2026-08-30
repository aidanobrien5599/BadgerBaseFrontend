import { describe, it, expect } from "vitest"
import { ALLOWED_ORIGINS, isAllowedOrigin } from "@/lib/allowed-origins"

describe("isAllowedOrigin", () => {
  it("accepts the production domains", () => {
    expect(isAllowedOrigin("https://badgerbase.app")).toBe(true)
    expect(isAllowedOrigin("https://www.sconniegrades.com")).toBe(true)
  })

  it("accepts a referer URL with a path", () => {
    expect(isAllowedOrigin("https://badgerbase.app/search?q=comp")).toBe(true)
  })

  it("accepts localhost dev origins", () => {
    expect(isAllowedOrigin("http://localhost:3000")).toBe(true)
  })

  it("rejects an unknown origin", () => {
    expect(isAllowedOrigin("https://evil.example.com")).toBe(false)
  })

  it("rejects a null origin", () => {
    expect(isAllowedOrigin(null)).toBe(false)
  })

  it("exposes the full list", () => {
    expect(ALLOWED_ORIGINS).toContain("https://badgerbase.app")
  })
})
