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
    50: "#fef1f1",
    100: "#fcd9d9",
    200: "#f4afaf",
    300: "#ed8282",
    400: "#ec5151",
    500: "#e71313",
    600: "#c61010",
    700: "#a50d0d",
    800: "#730d0d",
    900: "#500b0b",
  },
  gray: {
    50: "#fafafa",
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
  primary: colors.red[600],
  primaryHover: colors.red[700],
  text: colors.gray[900],
  textSecondary: colors.gray[600],
  textMuted: colors.gray[400],
  background: colors.gray[50],
  surface: "#ffffff",
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
