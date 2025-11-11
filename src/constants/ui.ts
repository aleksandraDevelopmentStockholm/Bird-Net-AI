import { Platform } from 'react-native';

// Simple fonts for React Native styled-components (avoids parsing issues)
export const Fonts = {
  sans: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  rounded: Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
};

// Spacing constants (in px)
export const SPACING = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

// Border radius constants (in px)
export const BORDER_RADIUS = {
  none: 0,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

// Font sizes (in px) - semantic naming for clarity
// Size scale optimized for accessibility: 14, 16, 18, 20, 24, 28, 32, 36, 40
export const FONT_SIZES = {
  metadata: '14px', // Timestamps, fine print (min readable)
  caption: '16px', // Image captions, helper text
  body: '20px', // Paragraphs, main content (comfortable reading, outdoor use)
  button: '18px', // Button labels (accessible target)
  subheading: '20px', // Section subheadings
  heading: '24px', // Card/section headings
  title: '28px', // Page titles
  display: '32px', // Large display text
  hero: '36px', // Hero/banner text
  jumbo: '40px', // Extra large headings
} as const;

// Font weights
export const FONT_WEIGHTS = {
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
} as const;

// Colors
export const COLORS = {
  // Primary colors
  primary: '#57a627ff',
  secondary: '#144650',
  accent: '#0099fb', // Bright sky blue for highlights and active states

  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',

  // Neutral colors
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  // Gray scale
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },

  // Green scale (for primary)
  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Theme specific colors
  light: {
    text: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    background: '#f9f9f9;',
    backgroundSecondary: '#f9fafb',
    border: '#6b7280',
    card: '#ffffff',
    placeholder: '#9ca3af',
  },

  dark: {
    text: '#ffffff',
    textSecondary: '#d1d5db', // Fixed: improved contrast from #212121
    textMuted: '#9ca3af',
    background: '#374151',
    backgroundSecondary: '#1f2937',
    border: '#d1d5db',
    card: '#1f2937',
    secondary: '#4b5563', // Improved contrast: lighter gray (WCAG AA compliant)
    placeholder: '#6b7280',
  },

  // Shadow colors
  shadow: {
    primary: '#359f5e',
    default: '#000000',
  },
} as const;

// Shadow properties
export const SHADOWS = {
  card: {
    shadowColor: COLORS.shadow.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  button: {
    shadowColor: COLORS.shadow.default,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    shadowColor: COLORS.shadow.default,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  floating: {
    // Matches web: 0 4px 12px rgba(0,0,0,0.15)
    shadowColor: COLORS.shadow.default,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// Button sizes
export const BUTTON_SIZES = {
  sm: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    fontSize: FONT_SIZES.caption,
    iconSize: 24,
    minHeight: 44,
    minWidth: 44,
    maxHeightRound: 60,
    maxWidthRound: 60,
  },
  md: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    fontSize: FONT_SIZES.button,
    iconSize: 48,
    minHeight: 72, // Ensures minimum touch target
    minWidth: 72, // Ensures minimum touch target
    maxHeightRound: 90,
    maxWidthRound: 90,
  },
  lg: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    fontSize: FONT_SIZES.hero,
    iconSize: 48,
    minHeight: 96, // Ensures minimum touch target
    minWidth: 96, // Ensures minimum touch target
    maxHeightRound: 120,
    maxWidthRound: 120,
  },
} as const;

// Input sizes
export const INPUT_SIZES = {
  default: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.sm,
    fontSize: FONT_SIZES.body, // Was .md, now using semantic name
  },
} as const;

// Typography variants
export const TYPOGRAPHY = {
  h1: {
    fontSize: FONT_SIZES.jumbo,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 1.2,
    fontFamily: Fonts.rounded,
  },
  h2: {
    fontSize: FONT_SIZES.display,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 1.3,
    fontFamily: Fonts.rounded,
  },
  h3: {
    fontSize: FONT_SIZES.title,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 1.3,
    fontFamily: Fonts.rounded,
  },
  h4: {
    fontSize: FONT_SIZES.heading,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 1.4,
    fontFamily: Fonts.rounded,
  },
  body: {
    fontSize: FONT_SIZES.body,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: 1.4,
    fontFamily: Fonts.sans,
  },
  caption: {
    fontSize: FONT_SIZES.caption,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: 1.4,
    fontFamily: Fonts.sans,
  },
  small: {
    fontSize: FONT_SIZES.metadata,
    fontWeight: FONT_WEIGHTS.normal,
    lineHeight: 1.4,
    fontFamily: Fonts.sans,
  },
} as const;

// Layout sizes
export const LAYOUT = {
  container: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.none,
  },
  card: {
    padding: SPACING.sm,
    margin: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
  },
  section: {
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.none,
  },
  grid: {
    padding: SPACING.md,
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.none,
  },
  flex: {
    padding: SPACING.none,
    borderRadius: BORDER_RADIUS.none,
  },
} as const;

// Border widths
export const BORDER_WIDTHS = {
  none: '0px',
  thin: '1px',
  thick: '2px',
} as const;

// Opacity values
export const OPACITY = {
  disabled: 0.5,
  inactive: 0.6,
  muted: 0.7,
  active: 0.7,
  full: 1,
} as const;

// Z-index values
export const Z_INDEX = {
  dropdown: 1000,
  modal: 1100,
  tooltip: 1200,
  notification: 1300,
} as const;
