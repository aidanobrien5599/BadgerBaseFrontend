import { describe, it, expect } from "vitest"
import { colors, semantic, chart, typography } from "@/lib/tokens"

describe("tokens", () => {
  describe("colors", () => {
    it("exports red palette with all shades", () => {
      expect(colors.red[50]).toBe("#fef1f1")
      expect(colors.red[500]).toBe("#e71313")
      expect(colors.red[600]).toBe("#c61010")
      expect(colors.red[700]).toBe("#a50d0d")
      expect(colors.red[900]).toBe("#500b0b")
    })

    it("exports gray palette with all shades", () => {
      expect(colors.gray[50]).toBe("#fafafa")
      expect(colors.gray[600]).toBe("#525252")
      expect(colors.gray[900]).toBe("#171717")
      expect(colors.gray[950]).toBe("#0a0a0a")
    })
  })

  describe("semantic", () => {
    it("maps semantic names to palette values", () => {
      expect(semantic.primary).toBe(colors.red[600])
      expect(semantic.primaryHover).toBe(colors.red[700])
      expect(semantic.text).toBe(colors.gray[900])
      expect(semantic.textSecondary).toBe(colors.gray[600])
      expect(semantic.background).toBe(colors.gray[50])
      expect(semantic.surface).toBe("#ffffff")
      expect(semantic.border).toBe(colors.gray[200])
      expect(semantic.destructive).toBe(colors.red[500])
    })
  })

  describe("chart", () => {
    it("maps chart indices to palette values", () => {
      expect(chart[1]).toBe(colors.red[600])
      expect(chart[2]).toBe(colors.gray[800])
      expect(chart[3]).toBe(colors.gray[500])
      expect(chart[4]).toBe(colors.red[400])
      expect(chart[5]).toBe(colors.red[300])
    })
  })

  describe("typography", () => {
    it("exports pixel values for font sizes", () => {
      expect(typography.xs).toBe(12)
      expect(typography.sm).toBe(14)
      expect(typography.base).toBe(16)
      expect(typography.lg).toBe(18)
    })
  })
})
