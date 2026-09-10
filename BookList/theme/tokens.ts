export const colors = {
  background: "#ffffff",
  coverPlaceholder: "#cbd5e1",
  danger: "#dc2626",
  primary: "#2563eb",
  text: "#0f172a",
  textMuted: "#475569",
  textOnPrimary: "#ffffff",
} as const;

export type ThemeMode = keyof typeof palettes;
export type ThemeColors = (typeof palettes)[ThemeMode];

export const spacing = {
  md: 8,
  lg: 24,
} as const;

export const typography = {
  title: 28,
  body: 18,
} as const;
