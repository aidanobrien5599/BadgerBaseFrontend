/**
 * Design token source of truth for server-side / non-CSS consumers
 * (emails, chart libraries, PDF exports, etc.).
 *
 * These values must stay in sync with the primitive/semantic HSL
 * custom properties defined in app/globals.css. CSS uses hsl() for
 * Tailwind v4 theme compatibility; this file uses hex equivalents
 * since server-rendered contexts (e.g. email HTML) often can't rely
 * on CSS custom properties.
 */

export const colors = {
  red: {
    50: "#fdf0ef",
    100: "#fad9d8",
    200: "#f2aeac",
    300: "#e77a77",
    400: "#db4a48",
    500: "#c90e0d",
    600: "#c5050c",
    700: "#8e0308",
    800: "#660307",
    900: "#470407",
  },
  gray: {
    50: "#faf8f6",
    100: "#f5f2ee",
    200: "#e5e0db",
    300: "#d3ccc4",
    400: "#b0a79e",
    500: "#928a82",
    600: "#655f5c",
    700: "#4a4440",
    800: "#2e2428",
    900: "#1b1113",
    950: "#0f0709",
  },
} as const

export const semantic = {
  primary: colors.red[600],
  primaryHover: colors.red[700],
  text: colors.gray[900],
  textSecondary: colors.gray[600],
  textMuted: colors.gray[400],
  background: colors.gray[50],
  surface: "#fdfcfb",
  border: colors.gray[200],
  destructive: colors.red[500],
} as const

export const chart = {
  1: colors.red[600],
  2: colors.gray[800],
  3: colors.gray[500],
  4: colors.red[400],
  5: colors.red[300],
} as const

export const typography = {
  xxs: 10,
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
} as const
