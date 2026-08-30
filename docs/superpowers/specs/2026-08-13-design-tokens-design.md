# BadgerBase Design Token System

**Date:** 2026-08-13
**Status:** Approved
**Approach:** Tailwind v4 upgrade + CSS-first design tokens

## Goal

Replace all hardcoded color, spacing, typography, and elevation values across the BadgerBase frontend with a scalable design token system. Tokens are defined as CSS custom properties, registered with Tailwind v4's `@theme` directive, and mirrored to a TypeScript constants file for server-side use.

**Primary objective:** Consistency — one place to change any design value.
**Secondary objective:** Structure tokens so multi-theme support (other university brands, expanded dark mode) can be added later without another refactor.

## Constraints

- `app/stim/*` is excluded from migration (intentionally chaotic styling).
- Email templates (`app/api/feedback/route.ts`) use `lib/tokens.ts` constants since HTML email cannot use CSS variables.
- shadcn/ui component tokens (`--primary`, `--background`, `--card`, etc.) are kept and extended, not replaced.

## Architecture

```
app/globals.css          <- single source of truth
  :root { }              <- primitive tokens (raw palette)
  :root { }              <- semantic tokens (what colors mean)
  .dark { }              <- dark mode overrides (semantic only)
  @theme { }             <- Tailwind v4 theme registration
  @layer base { }        <- reset, body defaults

lib/tokens.ts            <- server-side mirror (hex/HSL constants for emails, charts)

styles/globals.css       <- DELETED (unused duplicate)
tailwind.config.ts       <- DELETED (replaced by @theme in CSS)
postcss.config.mjs       <- UPDATED (switches to @tailwindcss/postcss)
```

### Token Naming Convention

| Layer | Pattern | Example |
|-------|---------|---------|
| Primitive | `--{color}-{shade}` | `--red-500`, `--gray-900` |
| Semantic | `--color-{role}` | `--color-primary`, `--color-surface` |
| Spacing | `--spacing-{n}` | `--spacing-4` (16px) |
| Typography | `--text-{size}`, `--font-{weight}` | `--text-sm`, `--font-bold` |
| Elevation | `--shadow-{size}` | `--shadow-md` |
| Radius | `--radius-{size}` | `--radius-lg` |

Components reference semantic tokens, never primitives directly.

## Token Definitions

### Color Primitives

```css
:root {
  --white: hsl(0 0% 100%);
  --black: hsl(0 0% 0%);

  /* Cardinal Red */
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

  /* Neutral */
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

### Semantic Color Tokens

```css
:root {
  /* Surfaces */
  --color-background:     var(--gray-50);
  --color-surface:        var(--white);
  --color-surface-raised: var(--white);
  --color-surface-sunken: var(--gray-100);

  /* Text */
  --color-text:           var(--gray-900);
  --color-text-secondary: var(--gray-600);
  --color-text-muted:     var(--gray-400);
  --color-text-inverse:   var(--white);

  /* Brand / Primary */
  --color-primary:        var(--red-600);
  --color-primary-hover:  var(--red-700);
  --color-primary-subtle: var(--red-50);
  --color-primary-fg:     var(--white);

  /* Feedback */
  --color-destructive:    var(--red-500);
  --color-destructive-fg: var(--white);

  /* Chrome */
  --color-border:         var(--gray-200);
  --color-input:          var(--gray-200);
  --color-ring:           var(--red-500);

  /* Charts */
  --chart-1: var(--red-600);
  --chart-2: var(--gray-800);
  --chart-3: var(--gray-500);
  --chart-4: var(--red-400);
  --chart-5: var(--red-300);
}

.dark {
  --color-background:     var(--gray-950);
  --color-surface:        hsl(0 0% 8%);
  --color-surface-raised: hsl(0 0% 10%);
  --color-surface-sunken: hsl(0 0% 5%);

  --color-text:           var(--gray-50);
  --color-text-secondary: var(--gray-400);
  --color-text-muted:     var(--gray-600);
  --color-text-inverse:   var(--gray-900);

  --color-primary:        var(--red-500);
  --color-primary-hover:  var(--red-400);
  --color-primary-subtle: hsl(0 50% 12%);
  --color-primary-fg:     var(--white);

  --color-destructive:    hsl(0 63% 31%);
  --color-destructive-fg: var(--white);

  --color-border:         hsl(0 0% 15%);
  --color-input:          hsl(0 0% 15%);
  --color-ring:           var(--red-500);

  --chart-1: var(--red-500);
  --chart-2: var(--gray-300);
  --chart-3: var(--gray-500);
  --chart-4: var(--red-300);
  --chart-5: var(--red-200);
}
```

### shadcn/ui Compatibility Mapping

The existing shadcn tokens are re-expressed in terms of our semantic layer:

```css
:root {
  --background:           var(--color-background);
  --foreground:           var(--color-text);
  --card:                 var(--color-surface);
  --card-foreground:      var(--color-text);
  --popover:              var(--color-surface-raised);
  --popover-foreground:   var(--color-text);
  --primary:              var(--color-primary);
  --primary-foreground:   var(--color-primary-fg);
  --secondary:            var(--gray-100);
  --secondary-foreground: var(--color-text);
  --muted:                var(--gray-100);
  --muted-foreground:     var(--color-text-muted);
  --accent:               var(--color-primary-subtle);
  --accent-foreground:    var(--color-text);
  --destructive:          var(--color-destructive);
  --destructive-foreground: var(--color-destructive-fg);
  --border:               var(--color-border);
  --input:                var(--color-input);
  --ring:                 var(--color-ring);
}
```

### Spacing

Registered via `@theme`. Tailwind v4's default 4px-base scale, made explicit:

```css
@theme {
  --spacing-0:  0px;
  --spacing-1:  4px;
  --spacing-2:  8px;
  --spacing-3:  12px;
  --spacing-4:  16px;
  --spacing-5:  20px;
  --spacing-6:  24px;
  --spacing-8:  32px;
  --spacing-10: 40px;
  --spacing-12: 48px;
  --spacing-16: 64px;
  --spacing-20: 80px;
  --spacing-24: 96px;
}
```

### Typography

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  --text-xs:   0.75rem;
  --text-sm:   0.875rem;
  --text-base: 1rem;
  --text-lg:   1.125rem;
  --text-xl:   1.25rem;
  --text-2xl:  1.5rem;
  --text-3xl:  1.875rem;
  --text-4xl:  2.25rem;
}
```

### Elevation

```css
@theme {
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.1);
}
```

### Radius

```css
:root {
  --radius:    0.5rem;
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}
```

## Server-Side Token Constants

`lib/tokens.ts` exports raw values for contexts that can't use CSS variables:

```ts
export const colors = {
  red: {
    50:  '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  gray: {
    50:  '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
} as const;

export const semantic = {
  primary:     colors.red[600],
  primaryHover: colors.red[700],
  text:        colors.gray[900],
  textSecondary: colors.gray[600],
  textMuted:   colors.gray[400],
  background:  colors.gray[50],
  surface:     '#ffffff',
  border:      colors.gray[200],
  destructive: colors.red[500],
} as const;

export const chart = {
  1: colors.red[600],
  2: colors.gray[800],
  3: colors.gray[500],
  4: colors.red[400],
  5: colors.red[300],
} as const;

export const typography = {
  xs:   12,
  sm:   14,
  base: 16,
  lg:   18,
} as const;
```

## Migration Plan

### Phase 1: Tailwind v4 Upgrade

1. Upgrade `tailwindcss` from `^3.4.17` to v4, install `@tailwindcss/postcss`
2. Remove `tailwind.config.ts` — migrate theme to `@theme` in `app/globals.css`
3. Update `postcss.config.mjs` to use `@tailwindcss/postcss` instead of `tailwindcss`
4. Replace `@tailwind base/components/utilities` directives with `@import "tailwindcss"` in `app/globals.css`
5. Remove `tailwindcss-animate` plugin — replace with v4 built-in animation utilities or inline keyframes
5. Update `components.json` for shadcn v4 compatibility
6. Fix any v3 → v4 class name changes
7. Delete `styles/globals.css` (unused duplicate)
8. Verify build passes

### Phase 2: Token Foundation

1. Define primitive color palette in `:root` in `app/globals.css`
2. Define semantic color tokens referencing primitives
3. Define dark mode overrides in `.dark`
4. Register spacing, typography, elevation, radius tokens in `@theme`
5. Map shadcn tokens to semantic layer
6. Create `lib/tokens.ts` with server-side constants

### Phase 3: Component Migration

File-by-file replacement, ordered by blast radius:

| Priority | Files | Changes |
|----------|-------|---------|
| 1 | `app/layout.tsx` | `bg-gray-50` → `bg-background` |
| 2 | `components/ui/*` (17 files) | Minor fixes — mostly already tokenized |
| 3 | `components/navigation.tsx`, `components/footer.tsx` | Hardcoded grays/reds → semantic tokens |
| 4 | `components/course-table.tsx` | Chart hex values → `lib/tokens.ts` imports, `fontSize` literals → token constants |
| 5 | `components/search-filters.tsx` | Any hardcoded colors → tokens |
| 6 | `app/about/page.tsx` | `text-gray-*`, `text-red-*`, `bg-red-*` → semantic classes |
| 7 | `app/feedback/page.tsx` | `text-red-600` → `text-destructive` or `text-primary` |
| 8 | `app/login/page.tsx`, `app/signup/page.tsx` | `bg-red-700` → `bg-primary`, `text-gray-*` → semantic |
| 9 | `app/dashboard/page.tsx` | `bg-gray-300`, `text-red-600` → tokens |
| 10 | `components/availability-calendar.tsx` | `fontSize: "10px"` → token constant |
| 11 | `app/api/feedback/route.ts` | Inline hex → `lib/tokens.ts` imports |
| Skip | `app/stim/*` | Excluded |

### Phase 4: Cleanup

1. Grep for remaining hardcoded values (`#[0-9a-f]`, `bg-gray-`, `text-red-`, `rgb(`, etc.)
2. Remove any unused CSS variables from old setup
3. Verify dark mode end to end
4. Verify all chart colors render correctly
5. Build + lint passes clean

## Codebase Mapping

### Files to Create
- `lib/tokens.ts`

### Files to Delete
- `styles/globals.css`
- `tailwind.config.ts`

### Files to Modify (major)
- `app/globals.css` — complete rewrite with token system
- `package.json` — tailwind v4, add @tailwindcss/postcss, remove tailwindcss-animate
- `postcss.config.mjs` — switch to @tailwindcss/postcss
- `components.json` — update for v4

### Files to Modify (migration)
- `app/layout.tsx`
- `app/page.tsx`
- `app/about/page.tsx`
- `app/feedback/page.tsx`
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/dashboard/page.tsx`
- `app/api/feedback/route.ts`
- `components/navigation.tsx`
- `components/footer.tsx`
- `components/course-table.tsx`
- `components/course-header.tsx`
- `components/search-filters.tsx`
- `components/availability-calendar.tsx`
- `components/login-dialog.tsx`
- `components/display-text.tsx`
- `components/trending-feed.tsx`
- `components/tiktok-feed.tsx`
- `components/notification.tsx`
- `components/notification-button.tsx`
- `components/maintenance-banner.tsx`
- `components/ui/*` (17 files, minor changes)
