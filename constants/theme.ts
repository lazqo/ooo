export const colors = {
  background: '#0A0F1C',
  surface: '#131B2E',
  surfaceLight: '#1C2A42',
  surfaceElevated: '#243451',
  primary: '#C9A84C',
  primaryLight: '#E8C96A',
  primaryDark: '#9A7B32',
  text: '#F5F0E8',
  textSecondary: '#9BA3B8',
  textMuted: '#4A5568',
  accent: '#E8836A',
  success: '#4CAF82',
  border: '#1E2D45',
  error: '#E85B5B',
  overlay: 'rgba(0,0,0,0.6)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  label: { fontSize: 12, fontWeight: '600' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },
  caption: { fontSize: 11, fontWeight: '400' as const },
} as const;
