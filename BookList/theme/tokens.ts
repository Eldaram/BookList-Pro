export const palettes = {
  light: {
    background: '#ffffff',
    text: '#0f172a',
    textMuted: '#475569',
  },
  dark: {
    background: '#0f172a',
    text: '#f8fafc',
    textMuted: '#94a3b8',
  },
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
