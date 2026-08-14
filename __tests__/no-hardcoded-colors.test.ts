import { execSync } from "child_process"
import { describe, it, expect } from "vitest"

// Full Tailwind default color palette (excludes semantic-only names like
// "primary", "success", etc. which are our own tokens and are expected to
// appear with numeric-like modifiers, e.g. `bg-success/10`).
const TAILWIND_PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|white|black"

describe("no hardcoded colors in codebase", () => {
  it("no hardcoded Tailwind color classes outside stim/", () => {
    // Matches any Tailwind utility (bg-, text-, border-, ring-, from-, to-,
    // via-, fill-, stroke-, outline-, decoration-, caret-, accent-, shadow-,
    // divide-) applied with a raw palette color + numeric shade, e.g.
    // `bg-red-500` or `text-gray-700`. Components must use the semantic
    // tokens defined in app/globals.css (bg-primary, text-muted-foreground,
    // bg-success, text-warning, etc.) instead.
    try {
      const result = execSync(
        `grep -rnE '(bg|text|border|ring|from|to|via|fill|stroke|outline|decoration|caret|accent|shadow|divide)-(${TAILWIND_PALETTE})-[0-9]' --include='*.tsx' --include='*.ts' app/ components/ lib/ | grep -v 'stim/' | grep -v 'node_modules' | grep -v '\\.next'`,
        { cwd: process.cwd(), encoding: "utf-8" }
      )
      if (result.trim()) {
        throw new Error(`Hardcoded Tailwind color classes found:\n${result}`)
      }
    } catch (e: any) {
      if (e.message?.includes("Hardcoded Tailwind color classes found")) throw e
      // grep exit 1 = no matches = pass
    }
  })

  it("no inline hex color values outside stim/, chart.tsx selectors, and lib/tokens.ts primitives", () => {
    // lib/tokens.ts is the primitive token layer itself (the source of truth
    // that CSS custom properties in app/globals.css are generated from) —
    // hex values there are expected and intentional, not a migration gap.
    // components/ui/chart.tsx targets Recharts' own inline SVG attributes
    // (`[stroke='#ccc']`, `[stroke='#fff']`) via arbitrary CSS selectors;
    // Recharts hardcodes these on its generated SVG nodes and they can't be
    // swapped for CSS variables, so the selectors must reference the literal
    // hex values while the associated Tailwind utility still resolves to a
    // semantic token (e.g. `stroke-border`).
    try {
      const result = execSync(
        `grep -rnE "['\\"]#[0-9a-fA-F]{3,8}" --include='*.tsx' --include='*.ts' app/ components/ lib/ | grep -v 'stim/' | grep -v 'node_modules' | grep -v 'components/ui/chart.tsx' | grep -v 'lib/tokens.ts'`,
        { cwd: process.cwd(), encoding: "utf-8" }
      )
      if (result.trim()) {
        throw new Error(`Inline hex values found:\n${result}`)
      }
    } catch (e: any) {
      if (e.message?.includes("Inline hex values found")) throw e
    }
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
