# Design Token System + Tailwind v4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace all hardcoded design values with a scalable CSS custom property token system built on Tailwind v4's `@theme` directive.

**Architecture:** CSS custom properties as single source of truth (`app/globals.css`), registered via Tailwind v4 `@theme inline` for utility class generation, with a TypeScript mirror (`lib/tokens.ts`) for server-side contexts. Primitive → semantic → shadcn compatibility layering.

**Tech Stack:** Next.js 15, React 19, Tailwind CSS v4, @tailwindcss/postcss, shadcn/ui, Vitest (new — for token tests)

**Spec:** `docs/superpowers/specs/2026-08-13-design-tokens-design.md`

## Global Constraints

- `app/stim/*` is excluded — do not modify any file under `app/stim/`.
- shadcn/ui tokens (`--primary`, `--background`, `--card`, etc.) are kept and extended, not replaced.
- Components reference semantic tokens, never primitive tokens directly in class names.
- Email templates use `lib/tokens.ts` constants (HTML email cannot use CSS variables).
- All CSS color variables use full `hsl()` values (Tailwind v4 convention), not bare HSL components.
- The `@theme inline` modifier is required (values reference CSS variables that change per theme).
- Keyframes for stim page animations must be preserved in CSS even though stim files are not modified — removing them would break the stim page.
- Every task must end with `next build` passing.

---

### Task 1: Tailwind v4 Upgrade

**Files:**
- Modify: `package.json`
- Modify: `postcss.config.mjs`
- Modify: `app/globals.css` (directive replacement only — token rewrite is Task 2)
- Modify: `components.json`
- Delete: `tailwind.config.ts`
- Delete: `styles/globals.css`
- Create: `vitest.config.ts`
- Test: `__tests__/build.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: Working Tailwind v4 build. `@theme inline` block with existing shadcn token mappings. Vitest configured. `app/globals.css` uses `@import "tailwindcss"` instead of `@tailwind` directives. All existing CSS variables use full `hsl()` values.

- [ ] **Step 1: Write the failing build verification test**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    include: ["__tests__/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
})
```

Create `__tests__/build.test.ts`:

```ts
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
```

- [ ] **Step 2: Install Tailwind v4, @tailwindcss/postcss, vitest**

```bash
pnpm add -D tailwindcss@latest @tailwindcss/postcss vitest
pnpm remove tailwindcss-animate
```

Note: `tailwindcss` moves from `devDependencies` (v3) to v4. `autoprefixer` can also be removed — Tailwind v4 handles vendor prefixes.

```bash
pnpm remove autoprefixer
```

- [ ] **Step 3: Update postcss.config.mjs**

Replace contents with:

```js
/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}

export default config
```

- [ ] **Step 4: Rewrite app/globals.css for Tailwind v4**

Replace the `@tailwind` directives and convert all CSS variable values from bare HSL components to full `hsl()` values. Move the keyframes from `tailwind.config.ts` to CSS. Register existing shadcn tokens via `@theme inline`.

```css
@import "tailwindcss";

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar-background: var(--sidebar-background);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(0 0% 3.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(0 0% 3.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(0 0% 3.9%);
  --primary: hsl(0 85% 49%);
  --primary-foreground: hsl(0 0% 98%);
  --secondary: hsl(0 0% 96.1%);
  --secondary-foreground: hsl(0 0% 9%);
  --muted: hsl(0 0% 96.1%);
  --muted-foreground: hsl(0 0% 45.1%);
  --accent: hsl(0 85% 76.7%);
  --accent-foreground: hsl(0 0% 9%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(0 0% 89.8%);
  --input: hsl(0 0% 89.8%);
  --ring: hsl(0 85% 49%);
  --chart-1: hsl(0 85% 49%);
  --chart-2: hsl(0 0% 20%);
  --chart-3: hsl(0 0% 60%);
  --chart-4: hsl(0 75% 65%);
  --chart-5: hsl(0 60% 75%);
  --radius: 0.5rem;
  --sidebar-background: hsl(0 0% 98%);
  --sidebar-foreground: hsl(240 5.3% 26.1%);
  --sidebar-primary: hsl(240 5.9% 10%);
  --sidebar-primary-foreground: hsl(0 0% 98%);
  --sidebar-accent: hsl(240 4.8% 95.9%);
  --sidebar-accent-foreground: hsl(240 5.9% 10%);
  --sidebar-border: hsl(220 13% 91%);
  --sidebar-ring: hsl(217.2 91.2% 59.8%);
}

.dark {
  --background: hsl(0 0% 5%);
  --foreground: hsl(0 0% 98%);
  --card: hsl(0 0% 8%);
  --card-foreground: hsl(0 0% 98%);
  --popover: hsl(0 0% 8%);
  --popover-foreground: hsl(0 0% 98%);
  --primary: hsl(0 85% 55%);
  --primary-foreground: hsl(0 0% 98%);
  --secondary: hsl(0 0% 14.9%);
  --secondary-foreground: hsl(0 0% 98%);
  --muted: hsl(0 0% 14.9%);
  --muted-foreground: hsl(0 0% 63.9%);
  --accent: hsl(0 85% 76.7%);
  --accent-foreground: hsl(0 0% 98%);
  --destructive: hsl(0 62.8% 30.6%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(0 0% 14.9%);
  --input: hsl(0 0% 14.9%);
  --ring: hsl(0 85% 55%);
  --chart-1: hsl(0 85% 55%);
  --chart-2: hsl(0 0% 70%);
  --chart-3: hsl(0 0% 50%);
  --chart-4: hsl(0 75% 70%);
  --chart-5: hsl(0 60% 80%);
  --sidebar-background: hsl(0 0% 8%);
  --sidebar-foreground: hsl(0 0% 95.9%);
  --sidebar-primary: hsl(0 85% 55%);
  --sidebar-primary-foreground: hsl(0 0% 100%);
  --sidebar-accent: hsl(0 0% 15.9%);
  --sidebar-accent-foreground: hsl(0 0% 95.9%);
  --sidebar-border: hsl(0 0% 15.9%);
  --sidebar-ring: hsl(0 85% 55%);
}

@keyframes accordion-down {
  from { height: 0; }
  to { height: var(--radix-accordion-content-height); }
}

@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to { height: 0; }
}

@keyframes super-fast-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.1; }
}

@keyframes hyper-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes border-flash {
  0%, 100% { border-color: red; }
  25% { border-color: yellow; }
  50% { border-color: lime; }
  75% { border-color: cyan; }
}

@keyframes bg-flash {
  0% { background-color: rgb(255, 0, 255); }
  25% { background-color: rgb(0, 255, 255); }
  50% { background-color: rgb(255, 255, 0); }
  75% { background-color: rgb(0, 0, 255); }
  100% { background-color: rgb(255, 0, 255); }
}

@keyframes text-flash {
  0%, 100% { color: inherit; }
  50% { color: rgb(255, 0, 0); }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 5: Update components.json**

Update the tailwind section for v4:

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "app/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

- [ ] **Step 6: Fix shadcn/ui component v3→v4 class changes**

Scan all `components/ui/*.tsx` files for Tailwind v3 patterns that changed in v4. Key changes:
- `hsl(var(--...))` wrapping in className strings is no longer needed — now the CSS variable holds the full color value. Grep for `hsl(var(` in component files and remove the wrapping.
- Check `components/ui/chart.tsx:55` for `[stroke='#ccc']` and `[stroke='#fff']` selectors — these reference Recharts internals and are fine to keep.
- The `ring-offset-background` utility may have changed — check `components/ui/button.tsx`, `components/ui/checkbox.tsx`, etc.

Run `grep -rn "hsl(var(" components/ui/` and replace each occurrence:
- `hsl(var(--border))` → `var(--border)` (since the CSS variable now holds the full `hsl()` value)

- [ ] **Step 7: Delete obsolete files**

```bash
rm tailwind.config.ts
rm styles/globals.css
```

- [ ] **Step 8: Add test script to package.json**

Add to scripts:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 9: Run build verification**

```bash
pnpm run build
```

Fix any v3→v4 class name issues that surface. Common ones:
- `data-[state=open]:animate-in` → check if this still works in v4
- Animation utility classes from `tailwindcss-animate` plugin → define equivalent CSS or use Tailwind v4's built-in animation utilities

- [ ] **Step 10: Run tests and commit**

```bash
pnpm test
git add -A
git commit -m "feat: upgrade to Tailwind v4, add vitest"
```

---

### Task 2: Token Foundation

**Files:**
- Modify: `app/globals.css` (add primitive + semantic token layers)
- Create: `lib/tokens.ts`
- Create: `__tests__/tokens.test.ts`

**Interfaces:**
- Consumes: Working Tailwind v4 build from Task 1
- Produces: `lib/tokens.ts` exporting `colors`, `semantic`, `chart`, `typography` objects. CSS custom properties for primitives (`--red-*`, `--gray-*`), semantic tokens (`--color-primary-hover`, `--color-surface`, `--color-text-secondary`, `--color-primary-subtle`), and extended Tailwind utilities via `@theme inline`. Existing shadcn tokens (`--primary`, `--background`, etc.) now reference primitive variables instead of inline HSL values.

- [ ] **Step 1: Write failing tests for lib/tokens.ts**

Create `__tests__/tokens.test.ts`:

```ts
import { describe, it, expect } from "vitest"
import { colors, semantic, chart, typography } from "@/lib/tokens"

describe("tokens", () => {
  describe("colors", () => {
    it("exports red palette with all shades", () => {
      expect(colors.red[50]).toBe("#fef2f2")
      expect(colors.red[500]).toBe("#ef4444")
      expect(colors.red[600]).toBe("#dc2626")
      expect(colors.red[700]).toBe("#b91c1c")
      expect(colors.red[900]).toBe("#7f1d1d")
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
pnpm test __tests__/tokens.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/tokens'`

- [ ] **Step 3: Create lib/tokens.ts**

```ts
export const colors = {
  red: {
    50:  "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
  gray: {
    50:  "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
} as const

export const semantic = {
  primary:      colors.red[600],
  primaryHover: colors.red[700],
  text:         colors.gray[900],
  textSecondary: colors.gray[600],
  textMuted:    colors.gray[400],
  background:   colors.gray[50],
  surface:      "#ffffff",
  border:       colors.gray[200],
  destructive:  colors.red[500],
} as const

export const chart = {
  1: colors.red[600],
  2: colors.gray[800],
  3: colors.gray[500],
  4: colors.red[400],
  5: colors.red[300],
} as const

export const typography = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
} as const
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
pnpm test __tests__/tokens.test.ts
```

Expected: PASS — all 4 test suites green.

- [ ] **Step 5: Add primitive color tokens to globals.css**

In `app/globals.css`, add a new `:root` block BEFORE the existing shadcn `:root` block for primitive tokens:

```css
:root {
  --white: hsl(0 0% 100%);
  --black: hsl(0 0% 0%);
  --red-50:  hsl(0 86% 97%);
  --red-100: hsl(0 85% 92%);
  --red-200: hsl(0 75% 82%);
  --red-300: hsl(0 75% 72%);
  --red-400: hsl(0 80% 62%);
  --red-500: hsl(0 85% 49%);
  --red-600: hsl(0 85% 42%);
  --red-700: hsl(0 85% 35%);
  --red-800: hsl(0 80% 25%);
  --red-900: hsl(0 75% 18%);
  --gray-50:  hsl(0 0% 98%);
  --gray-100: hsl(0 0% 96%);
  --gray-200: hsl(0 0% 90%);
  --gray-300: hsl(0 0% 83%);
  --gray-400: hsl(0 0% 64%);
  --gray-500: hsl(0 0% 45%);
  --gray-600: hsl(0 0% 32%);
  --gray-700: hsl(0 0% 25%);
  --gray-800: hsl(0 0% 15%);
  --gray-900: hsl(0 0% 9%);
  --gray-950: hsl(0 0% 4%);
}
```

- [ ] **Step 6: Rewrite shadcn token values to reference primitives**

Update the existing `:root` shadcn block to reference primitive variables:

```css
:root {
  /* ... primitives above ... */
  --background: var(--gray-50);
  --foreground: var(--gray-900);
  --card: var(--white);
  --card-foreground: var(--gray-900);
  --popover: var(--white);
  --popover-foreground: var(--gray-900);
  --primary: var(--red-600);
  --primary-foreground: var(--white);
  --secondary: var(--gray-100);
  --secondary-foreground: var(--gray-900);
  --muted: var(--gray-100);
  --muted-foreground: var(--gray-500);
  --accent: var(--red-50);
  --accent-foreground: var(--gray-900);
  --destructive: var(--red-500);
  --destructive-foreground: var(--white);
  --border: var(--gray-200);
  --input: var(--gray-200);
  --ring: var(--red-500);
  --chart-1: var(--red-600);
  --chart-2: var(--gray-800);
  --chart-3: var(--gray-500);
  --chart-4: var(--red-400);
  --chart-5: var(--red-300);
  --radius: 0.5rem;
  --sidebar-background: var(--gray-50);
  --sidebar-foreground: var(--gray-700);
  --sidebar-primary: var(--gray-900);
  --sidebar-primary-foreground: var(--white);
  --sidebar-accent: var(--gray-100);
  --sidebar-accent-foreground: var(--gray-900);
  --sidebar-border: var(--gray-200);
  --sidebar-ring: var(--red-500);
}
```

- [ ] **Step 7: Add extended semantic tokens and register in @theme**

Add to `:root`:

```css
:root {
  /* Extended semantic tokens */
  --primary-hover: var(--red-700);
  --primary-subtle: var(--red-50);
  --surface: var(--white);
  --surface-raised: var(--white);
  --surface-sunken: var(--gray-100);
  --text-secondary: var(--gray-600);
  --text-inverse: var(--white);
}
```

Add to `.dark`:

```css
.dark {
  /* ... existing overrides ... */
  --primary-hover: var(--red-400);
  --primary-subtle: hsl(0 50% 12%);
  --surface: hsl(0 0% 8%);
  --surface-raised: hsl(0 0% 10%);
  --surface-sunken: hsl(0 0% 5%);
  --text-secondary: var(--gray-400);
  --text-inverse: var(--gray-900);
}
```

Add to `@theme inline`:

```css
@theme inline {
  /* ... existing mappings ... */
  --color-primary-hover: var(--primary-hover);
  --color-primary-subtle: var(--primary-subtle);
  --color-surface: var(--surface);
  --color-surface-raised: var(--surface-raised);
  --color-surface-sunken: var(--surface-sunken);
  --color-text-secondary: var(--text-secondary);
  --color-text-inverse: var(--text-inverse);
}
```

- [ ] **Step 8: Add spacing, typography, and elevation to @theme**

Tailwind v4 provides defaults, but making them explicit in `@theme` ensures they're overridable for future theming. Add to the `@theme inline` block in `app/globals.css`:

```css
@theme inline {
  /* ... existing mappings ... */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
}

@theme {
  --spacing: 4px;
}
```

Note: `--spacing: 4px` sets the base multiplier — `p-4` = 16px, `p-6` = 24px, etc. This is Tailwind v4's default but making it explicit means a future theme can change the spacing scale by changing one value. Typography and elevation use Tailwind's built-in defaults which are already part of v4 — no need to re-declare them unless overriding.

- [ ] **Step 9: Update body base styles**

In the `@layer base` block, change:

```css
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

(Remove any `bg-gray-50` from body/html — now `bg-background` resolves to `var(--gray-50)` via the token chain.)

- [ ] **Step 10: Run build and tests**

```bash
pnpm run build
pnpm test
```

Both must pass.

- [ ] **Step 11: Commit**

```bash
git add lib/tokens.ts __tests__/tokens.test.ts app/globals.css
git commit -m "feat: add design token foundation with primitive and semantic layers"
```

---

### Task 3: Layout + Shared Chrome Migration

**Files:**
- Modify: `app/layout.tsx`
- Modify: `components/navigation.tsx`
- Modify: `components/footer.tsx`
- Modify: `components/auth-button.tsx`
- Modify: `components/maintenance-banner.tsx`
- Create: `__tests__/no-hardcoded-colors.test.ts`

**Interfaces:**
- Consumes: Token foundation from Task 2. Extended semantic tokens: `bg-primary`, `hover:bg-primary-hover`, `text-primary`, `bg-surface`, `text-foreground`, `text-text-secondary`, `border-border`, `bg-background`.
- Produces: All five files free of hardcoded Tailwind color classes. A reusable grep-based test that verifies no hardcoded colors remain in specified files.

- [ ] **Step 1: Write failing grep test**

Create `__tests__/no-hardcoded-colors.test.ts`:

```ts
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
      try {
        const result = execSync(
          `grep -nE '(bg|text|border|ring)-(gray|red|white|black|blue|green|orange|purple|pink|yellow)-[0-9]' ${file}`,
          { cwd: process.cwd(), encoding: "utf-8" }
        )
        expect(result.trim()).toBe("")
      } catch {
        // grep returns exit 1 when no matches — that's what we want
      }
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test __tests__/no-hardcoded-colors.test.ts
```

Expected: FAIL — multiple files still contain hardcoded color classes.

- [ ] **Step 3: Migrate app/layout.tsx**

Replace: `className="min-h-screen bg-gray-50"` → `className="min-h-screen bg-background"`

- [ ] **Step 4: Migrate components/navigation.tsx**

Replacements:
- `"text-red-700"` → `"text-primary"`
- `"text-gray-700 hover:text-red-700"` → `"text-foreground hover:text-primary"`
- `"bg-white border-b border-gray-200"` → `"bg-surface border-b border-border"`
- `"text-gray-900"` → `"text-foreground"` (the logo text)
- `"border-gray-200"` (mobile menu border) → `"border-border"`

- [ ] **Step 5: Migrate components/footer.tsx**

Replacements:
- `"bg-gray-50 border-t border-gray-200"` → `"bg-background border-t border-border"`
- `"text-gray-600"` → `"text-muted-foreground"`
- `"text-red-600"` → `"text-primary"`
- `"text-gray-500"` → `"text-muted-foreground"`
- `"text-gray-400"` → `"text-muted-foreground/60"`

- [ ] **Step 6: Migrate components/auth-button.tsx**

Replacements:
- `"bg-red-700 text-white"` → `"bg-primary text-primary-foreground"`
- `"bg-red-700 hover:bg-red-800 text-white"` → `"bg-primary hover:bg-primary-hover text-primary-foreground"`

- [ ] **Step 7: Migrate components/maintenance-banner.tsx**

Replacements:
- `"bg-red-600 border-b-4 border-red-800"` → `"bg-destructive border-b-4 border-destructive/80"`
- `"bg-red-600 border-red-700 text-white"` → `"bg-destructive border-destructive text-destructive-foreground"`

- [ ] **Step 8: Run tests and build**

```bash
pnpm test __tests__/no-hardcoded-colors.test.ts
pnpm run build
```

- [ ] **Step 9: Commit**

```bash
git add app/layout.tsx components/navigation.tsx components/footer.tsx components/auth-button.tsx components/maintenance-banner.tsx __tests__/no-hardcoded-colors.test.ts
git commit -m "feat: migrate layout and shared chrome to design tokens"
```

---

### Task 4: Course Feature Migration

**Files:**
- Modify: `components/course-table.tsx`
- Modify: `components/course-header.tsx`
- Modify: `components/availability-calendar.tsx`
- Modify: `components/sections/SectionDetails.tsx`
- Modify: `components/sections/LectureRow.tsx`
- Modify: `components/sections/HierarchicalSections.tsx`
- Update: `__tests__/no-hardcoded-colors.test.ts` (add these files to MIGRATED_FILES)

**Interfaces:**
- Consumes: `lib/tokens.ts` exports `chart`, `colors`, `typography`. Semantic token classes from Task 2.
- Produces: Chart components import colors from `lib/tokens.ts` instead of inline hex. All course-related components use semantic token classes.

- [ ] **Step 1: Add files to the grep test**

Add to `MIGRATED_FILES` in `__tests__/no-hardcoded-colors.test.ts`:

```ts
"components/course-table.tsx",
"components/course-header.tsx",
"components/availability-calendar.tsx",
"components/sections/SectionDetails.tsx",
"components/sections/LectureRow.tsx",
"components/sections/HierarchicalSections.tsx",
```

- [ ] **Step 2: Write failing test for chart hex values**

Add a test to `__tests__/no-hardcoded-colors.test.ts`:

```ts
it("course-table.tsx has no inline hex color values", () => {
  try {
    const result = execSync(
      `grep -nE 'fill: "#[0-9a-fA-F]' components/course-table.tsx`,
      { cwd: process.cwd(), encoding: "utf-8" }
    )
    expect(result.trim()).toBe("")
  } catch {
    // no matches = pass
  }
})

it("course-table.tsx has no inline fontSize values", () => {
  try {
    const result = execSync(
      `grep -nE 'fontSize: [0-9]' components/course-table.tsx`,
      { cwd: process.cwd(), encoding: "utf-8" }
    )
    expect(result.trim()).toBe("")
  } catch {
    // no matches = pass
  }
})
```

- [ ] **Step 3: Run tests to verify failure**

```bash
pnpm test __tests__/no-hardcoded-colors.test.ts
```

- [ ] **Step 4: Migrate course-table.tsx**

Add import at top: `import { chart, colors, typography } from "@/lib/tokens"`

Replace the hardcoded grade distribution fill colors (around line 241-271):
- `fill: "#dc2626"` → `fill: colors.red[600]`
- `fill: "#ef4444"` → `fill: colors.red[500]`
- `fill: "#f87171"` → `fill: colors.red[400]`
- `fill: "#fca5a5"` → `fill: colors.red[300]`
- `fill: "#fecaca"` → `fill: colors.red[200]`
- `fill: "#fee2e2"` → `fill: colors.red[100]`
- `fill: "#991b1b"` → `fill: colors.red[800]`

Replace chart axis tick styles (around line 473-478):
- `tick={{ fontSize: 14, fontWeight: 600, fill: "#374151" }}` → `tick={{ fontSize: typography.sm, fontWeight: 600, fill: colors.gray[700] }}`
- `tick={{ fontSize: 12, fill: "#374151" }}` → `tick={{ fontSize: typography.xs, fill: colors.gray[700] }}`

- [ ] **Step 5: Migrate course-header.tsx**

Replacements:
- `"text-gray-600"` → `"text-muted-foreground"`
- `"text-red-600 hover:text-red-700"` → `"text-primary hover:text-primary/80"`
- `"bg-red-600 text-white"` → `"bg-primary text-primary-foreground"`
- `"bg-red-50 text-red-700 border-red-200"` → `"bg-accent text-primary border-primary/20"`
- `"bg-red-500 text-white"` → `"bg-primary/85 text-primary-foreground"`
- `"bg-red-400 text-white"` → `"bg-primary/70 text-primary-foreground"`
- `"bg-red-300 text-red-800"` → `"bg-primary/50 text-primary"`
- `"bg-red-200 text-red-800"` → `"bg-primary/30 text-primary"`
- `"bg-red-100 text-red-700"` → `"bg-primary/20 text-primary"`
- `"bg-red-700 text-white"` → `"bg-destructive text-destructive-foreground"`
- `"bg-gray-100 text-gray-700"` → `"bg-muted text-muted-foreground"`
- `"bg-white"` → `"bg-surface"`
- `"text-gray-900"` → `"text-foreground"`
- `"hover:bg-gray-100"` → `"hover:bg-muted"`
- `"text-gray-600"` (chevron) → `"text-muted-foreground"`
- `"hover:text-red-600"` → `"hover:text-primary"`

- [ ] **Step 6: Migrate availability-calendar.tsx**

Add import: `import { typography } from "@/lib/tokens"`

Replace: `style={{ fontSize: "10px" }}` → `style={{ fontSize: typography.xs }}`

- [ ] **Step 7: Migrate section components**

`components/sections/SectionDetails.tsx` — all three repeated section blocks:
- `"text-gray-900"` → `"text-foreground"`
- `"text-gray-700"` → `"text-muted-foreground"`
- `"text-red-600"` → `"text-primary"`

`components/sections/LectureRow.tsx`:
- `"bg-white"` → `"bg-surface"`
- `"text-red-600"` → `"text-primary"`
- `"text-gray-900"` → `"text-foreground"`
- `"text-gray-700"` → `"text-muted-foreground"`

`components/sections/HierarchicalSections.tsx`:
- `"text-gray-500 border rounded-lg bg-gray-50"` → `"text-muted-foreground border rounded-lg bg-background"`

- [ ] **Step 8: Run tests and build**

```bash
pnpm test
pnpm run build
```

- [ ] **Step 9: Commit**

```bash
git add components/course-table.tsx components/course-header.tsx components/availability-calendar.tsx components/sections/ __tests__/no-hardcoded-colors.test.ts
git commit -m "feat: migrate course feature components to design tokens"
```

---

### Task 5: Auth + Dashboard Pages Migration

**Files:**
- Modify: `app/login/page.tsx`
- Modify: `app/signup/page.tsx`
- Modify: `app/dashboard/page.tsx`
- Modify: `components/login-dialog.tsx`
- Modify: `components/notification-button.tsx`
- Update: `__tests__/no-hardcoded-colors.test.ts`

**Interfaces:**
- Consumes: Semantic token classes from Task 2.
- Produces: All auth and dashboard files free of hardcoded color classes.

- [ ] **Step 1: Add files to grep test and verify failure**

Add to MIGRATED_FILES:
```ts
"app/login/page.tsx",
"app/signup/page.tsx",
"app/dashboard/page.tsx",
"components/login-dialog.tsx",
"components/notification-button.tsx",
```

Run `pnpm test __tests__/no-hardcoded-colors.test.ts` — expect failures.

- [ ] **Step 2: Migrate app/login/page.tsx**

Replacements:
- `"bg-gray-50"` → `"bg-background"`
- `"text-gray-600"` → `"text-muted-foreground"`
- `"bg-white"` → `"bg-surface"`
- `"text-gray-900"` → `"text-foreground"`
- `"text-gray-400"` → `"text-muted-foreground/60"`
- `"text-red-700"` → `"text-primary"`
- `"hover:text-red-700"` → `"hover:text-primary"`
- `"hover:text-red-800"` → `"hover:text-primary/90"`
- `"group-focus-within:text-red-700"` → `"group-focus-within:text-primary"`
- `"bg-red-700 hover:bg-red-800 text-white"` → `"bg-primary hover:bg-primary-hover text-primary-foreground"`

- [ ] **Step 3: Migrate app/signup/page.tsx**

Same patterns as login — see login replacements above. Additionally:
- `"text-red-600"` → `"text-destructive"` (for form validation errors)

- [ ] **Step 4: Migrate app/dashboard/page.tsx**

Replacements:
- `"border-red-500"` → `"border-destructive"`
- `"text-red-600"` (error title + alert icon) → `"text-destructive"`
- `"bg-gray-300"` → `"bg-border"` (the divider element)
- `"bg-green-500 hover:bg-green-600"` → keep as-is (status color, not part of brand tokens)
- `"text-green-600"` → keep as-is (available seats indicator)

Note: Green status colors (open/available) are semantic to the domain, not the brand. Keep them or add `--color-success` if you prefer, but the spec does not define a success token. Keep green as-is.

- [ ] **Step 5: Migrate components/login-dialog.tsx**

Read the file first to identify hardcoded colors, then apply the same patterns.

- [ ] **Step 6: Migrate components/notification-button.tsx**

Replacements:
- `"border-red-600 text-red-600 hover:bg-red-50 hover:text-red-700"` → `"border-primary text-primary hover:bg-accent hover:text-primary"`
- `"bg-red-600 text-white hover:bg-red-700"` → `"bg-primary text-primary-foreground hover:bg-primary-hover"`

- [ ] **Step 7: Run tests and build**

```bash
pnpm test
pnpm run build
```

- [ ] **Step 8: Commit**

```bash
git add app/login/page.tsx app/signup/page.tsx app/dashboard/page.tsx components/login-dialog.tsx components/notification-button.tsx __tests__/no-hardcoded-colors.test.ts
git commit -m "feat: migrate auth and dashboard pages to design tokens"
```

---

### Task 6: Static Pages + Remaining Components + Email Migration

**Files:**
- Modify: `app/about/page.tsx`
- Modify: `app/feedback/page.tsx`
- Modify: `components/display-text.tsx`
- Modify: `components/trending-feed.tsx`
- Modify: `components/tiktok-feed.tsx`
- Modify: `components/notification.tsx`
- Modify: `components/notification-ticker.tsx`
- Modify: `app/api/feedback/route.ts`
- Update: `__tests__/no-hardcoded-colors.test.ts`

**Interfaces:**
- Consumes: `lib/tokens.ts` exports `semantic`, `colors`. Semantic token classes from Task 2.
- Produces: All listed files migrated. Email template in `app/api/feedback/route.ts` imports hex values from `lib/tokens.ts`.

- [ ] **Step 1: Add files to grep test and verify failure**

Add all files above to MIGRATED_FILES. Run tests — expect failures.

- [ ] **Step 2: Migrate app/about/page.tsx**

Replacements:
- `"text-gray-900"` → `"text-foreground"`
- `"text-gray-600"` → `"text-muted-foreground"`
- `"text-red-600"` → `"text-primary"`
- `"bg-red-50"` → `"bg-accent"`
- `"text-red-900"` → `"text-primary"`
- `"text-red-700"` → `"text-primary"`
- `"bg-red-600 text-white rounded-md hover:bg-red-700"` → `"bg-primary text-primary-foreground rounded-md hover:bg-primary-hover"`

- [ ] **Step 3: Migrate app/feedback/page.tsx**

Replacements:
- `"text-gray-900"` → `"text-foreground"`
- `"text-gray-600"` → `"text-muted-foreground"`
- `"text-red-600"` (validation errors) → `"text-destructive"`

- [ ] **Step 4: Migrate remaining components**

`components/display-text.tsx`:
- `"bg-white"` → `"bg-surface"`
- `"text-gray-700"` → `"text-muted-foreground"`
- `"text-blue-500"` → `"text-primary"` (show more link)
- `"text-gray-600"` → `"text-muted-foreground"`

`components/trending-feed.tsx`:
- `"hover:bg-gray-50"` → `"hover:bg-muted"`
- `"text-gray-500"` → `"text-muted-foreground"`
- `"text-gray-800"` → `"text-foreground"`
- `"text-red-500"` (liked heart) → `"text-destructive"`
- `"bg-gradient-to-r from-orange-500 to-red-500"` → keep as-is (decorative gradient, not brand)
- `"bg-gradient-to-r from-purple-400 to-pink-400"` → keep as-is (decorative avatar gradient)
- `"bg-gradient-to-r from-orange-400 to-red-400"` → keep as-is (decorative trending badge)

`components/tiktok-feed.tsx`:
- `"bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200"` → keep as-is (decorative, not brand)
- `"text-yellow-500"` → keep as-is (decorative star)
- `"text-red-500"` → keep as-is (decorative fire icon)
- `"fill-red-500 text-red-500"` (heart) → `"fill-destructive text-destructive"`

`components/notification.tsx` / `components/notification-ticker.tsx`:
- `"bg-blue-500"`, `"bg-green-500"`, `"bg-orange-500"`, `"bg-purple-500"` → keep as-is (these are categorical notification colors, not brand tokens)

- [ ] **Step 5: Migrate email template in app/api/feedback/route.ts**

Add import: `import { semantic, colors } from "@/lib/tokens"`

Replace inline hex values in the HTML email template:
- `color: #dc2626` → `color: ${semantic.primary}`
- `border-bottom: 2px solid #dc2626` → `border-bottom: 2px solid ${semantic.primary}`
- `color: #374151` → `color: ${colors.gray[700]}`
- `color: #4b5563` → `color: ${colors.gray[600]}`
- `background: #f9fafb` → `background: ${colors.gray[50]}`
- `background: #f3f4f6` → `background: ${colors.gray[100]}`

- [ ] **Step 6: Run tests and build**

```bash
pnpm test
pnpm run build
```

- [ ] **Step 7: Commit**

```bash
git add app/about/page.tsx app/feedback/page.tsx components/display-text.tsx components/trending-feed.tsx components/tiktok-feed.tsx components/notification.tsx components/notification-ticker.tsx app/api/feedback/route.ts __tests__/no-hardcoded-colors.test.ts
git commit -m "feat: migrate static pages, remaining components, and email template to design tokens"
```

---

### Task 7: UI Components Audit + Final Cleanup

**Files:**
- Modify: `components/ui/*.tsx` (17 files — audit and fix)
- Modify: `components/ui/chart.tsx` (Recharts selector strings with hex)
- Update: `__tests__/no-hardcoded-colors.test.ts` (comprehensive final check)

**Interfaces:**
- Consumes: All prior tasks complete.
- Produces: Zero hardcoded color values in any file outside `app/stim/`. Clean build. All tests pass.

- [ ] **Step 1: Write comprehensive grep test**

Replace the MIGRATED_FILES list with a comprehensive glob that checks ALL tsx/ts files except stim:

```ts
import { execSync } from "child_process"
import { describe, it, expect } from "vitest"

describe("no hardcoded colors in codebase", () => {
  it("no hardcoded Tailwind color classes outside stim/", () => {
    try {
      const result = execSync(
        `grep -rnE '(bg|text|border|ring|from|to|via)-(gray|red|white|black)-[0-9]' --include='*.tsx' --include='*.ts' app/ components/ | grep -v 'stim/' | grep -v 'node_modules' | grep -v '.next'`,
        { cwd: process.cwd(), encoding: "utf-8" }
      )
      if (result.trim()) {
        throw new Error(`Hardcoded colors found:\n${result}`)
      }
    } catch (e: any) {
      if (e.message?.includes("Hardcoded colors found")) throw e
      // grep exit 1 = no matches = pass
    }
  })

  it("no inline hex color values outside stim/ and chart.tsx selector strings", () => {
    try {
      const result = execSync(
        `grep -rnE '"#[0-9a-fA-F]{3,8}"' --include='*.tsx' --include='*.ts' app/ components/ | grep -v 'stim/' | grep -v 'node_modules' | grep -v 'chart.tsx'`,
        { cwd: process.cwd(), encoding: "utf-8" }
      )
      if (result.trim()) {
        throw new Error(`Inline hex values found:\n${result}`)
      }
    } catch (e: any) {
      if (e.message?.includes("Inline hex values found")) throw e
    }
  })
})
```

- [ ] **Step 2: Run tests to find remaining violations**

```bash
pnpm test __tests__/no-hardcoded-colors.test.ts
```

Review the output to identify any remaining hardcoded values.

- [ ] **Step 3: Fix remaining violations in UI components**

Common fixes in `components/ui/*.tsx`:
- Any remaining `hsl(var(--...))` patterns should be `var(--...)` in Tailwind v4
- `components/ui/chart.tsx` — the `[stroke='#ccc']` and `[stroke='#fff']` CSS selectors target Recharts SVG internals and cannot use CSS variables. These are exceptions — keep them but note in the test exclusion.

- [ ] **Step 4: Final build and full test suite**

```bash
pnpm run build
pnpm test
```

All tests must pass. Build must succeed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: complete design token migration — audit UI components, final cleanup"
```
