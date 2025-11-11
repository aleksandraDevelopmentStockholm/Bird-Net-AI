# Theme System Usage Guide

The theme system has been refactored to eliminate the need to import `useTheme` in every component. Instead, use the new utility hooks for cleaner, more semantic code.

## Quick Start

```tsx
// OLD WAY ❌ (still works, but verbose)
import { useTheme } from '@/components/theme/ThemeProvider';
import { COLORS } from '@/constants/ui';

function MyComponent() {
  const { isDark } = useTheme();
  const bgColor = isDark ? COLORS.dark.background : COLORS.light.background;

  return <View style={{ backgroundColor: bgColor }} />;
}

// NEW WAY ✅ (cleaner, semantic)
import { useThemedColors } from '@/components/theme';

function MyComponent() {
  const colors = useThemedColors();

  return <View style={{ backgroundColor: colors.background }} />;
}
```

## Available Hooks

### 1. `useThemedColors()` - Get theme-aware colors

Returns an object with all semantic colors that automatically adapt to light/dark mode.

```tsx
import { useThemedColors } from '@/components/theme';

function MyComponent() {
  const colors = useThemedColors();

  // Access any semantic color:
  colors.background; // Background color
  colors.backgroundSecondary; // Secondary background
  colors.text; // Primary text color
  colors.textSecondary; // Secondary text color
  colors.textMuted; // Muted text color
  colors.border; // Border color
  colors.card; // Card background
  colors.placeholder; // Placeholder text
  colors.secondary; // Secondary brand color

  // Static colors (same in light/dark):
  colors.primary; // Primary brand color
  colors.accent; // Accent color
  colors.success; // Success color
  colors.warning; // Warning color
  colors.danger; // Danger color
  colors.white; // White
  colors.black; // Black
  colors.transparent; // Transparent

  // Utility method:
  colors.get('secondary'); // Get any color by name

  // Check current theme:
  colors.isDark; // true if dark mode

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.textSecondary }}>Hello World</Text>
    </View>
  );
}
```

### 2. `useThemedStyles()` - Create theme-aware StyleSheets

Use this for creating StyleSheet styles that automatically update with theme changes.

```tsx
import { useThemedStyles } from '@/components/theme';

function MyComponent() {
  // Pass a function that receives colors and returns styles
  const styles = useThemedStyles((colors) => ({
    container: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: 1,
      padding: 16,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: 'bold',
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: 16,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Title</Text>
      <Text style={styles.subtitle}>Subtitle</Text>
    </View>
  );
}
```

### 3. `useThemedStyle()` - Get a single themed style object

For dynamic or inline styles without creating a StyleSheet.

```tsx
import { useThemedStyle } from '@/components/theme';

function MyComponent({ isActive }) {
  const containerStyle = useThemedStyle((colors) => ({
    backgroundColor: isActive ? colors.primary : colors.background,
    borderColor: colors.border,
    padding: 16,
  }));

  return <View style={containerStyle}>...</View>;
}
```

## Migration Examples

### Example 1: Simple Component

**Before:**

```tsx
import { useTheme } from '@/components/theme/ThemeProvider';
import { COLORS } from '@/constants/ui';

function Card({ children }) {
  const { isDark } = useTheme();

  return (
    <View
      style={{
        backgroundColor: isDark ? COLORS.dark.card : COLORS.light.card,
        borderColor: isDark ? COLORS.dark.border : COLORS.light.border,
      }}
    >
      {children}
    </View>
  );
}
```

**After:**

```tsx
import { useThemedColors } from '@/components/theme';

function Card({ children }) {
  const colors = useThemedColors();

  return (
    <View
      style={{
        backgroundColor: colors.card,
        borderColor: colors.border,
      }}
    >
      {children}
    </View>
  );
}
```

### Example 2: With StyleSheet

**Before:**

```tsx
import { StyleSheet } from 'react-native';
import { useTheme } from '@/components/theme/ThemeProvider';
import { COLORS, SPACING } from '@/constants/ui';

function Section({ title, children }) {
  const { isDark } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View
        style={[
          styles.content,
          {
            backgroundColor: isDark ? COLORS.dark.backgroundSecondary : COLORS.gray[50],
            borderColor: isDark ? COLORS.dark.border : COLORS.gray[200],
          },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: SPACING.lg },
  title: { fontSize: 24, marginBottom: SPACING.md },
  content: { padding: SPACING.md, borderRadius: 8, borderWidth: 1 },
});
```

**After:**

```tsx
import { useThemedStyles } from '@/components/theme';
import { SPACING } from '@/constants/ui';

function Section({ title, children }) {
  const styles = useThemedStyles((colors) => ({
    container: {
      marginBottom: SPACING.lg,
    },
    title: {
      fontSize: 24,
      marginBottom: SPACING.md,
      color: colors.text,
    },
    content: {
      padding: SPACING.md,
      borderRadius: 8,
      borderWidth: 1,
      backgroundColor: colors.backgroundSecondary,
      borderColor: colors.border,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
}
```

### Example 3: Conditional Styles

**Before:**

```tsx
import { useTheme } from '@/components/theme/ThemeProvider';
import { COLORS } from '@/constants/ui';

function Button({ variant, onPress, children }) {
  const { isDark } = useTheme();

  const getBackgroundColor = () => {
    if (variant === 'primary') return COLORS.primary;
    return isDark ? COLORS.dark.card : COLORS.light.card;
  };

  return (
    <TouchableOpacity style={{ backgroundColor: getBackgroundColor() }} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}
```

**After:**

```tsx
import { useThemedColors } from '@/components/theme';

function Button({ variant, onPress, children }) {
  const colors = useThemedColors();

  const backgroundColor = variant === 'primary' ? colors.primary : colors.card;

  return (
    <TouchableOpacity style={{ backgroundColor }} onPress={onPress}>
      {children}
    </TouchableOpacity>
  );
}
```

## Available Semantic Colors

All colors automatically adapt to the current theme (light/dark):

| Semantic Name         | Light Mode  | Dark Mode    | Usage                   |
| --------------------- | ----------- | ------------ | ----------------------- |
| `text`                | Dark gray   | White        | Primary text            |
| `textSecondary`       | Medium gray | Light gray   | Secondary text          |
| `textMuted`           | Light gray  | Medium gray  | Muted/disabled text     |
| `background`          | Light       | Dark gray    | Main background         |
| `backgroundSecondary` | Very light  | Darker gray  | Cards, sections         |
| `border`              | Gray        | Light gray   | Borders, dividers       |
| `card`                | White       | Dark gray    | Card backgrounds        |
| `placeholder`         | Medium gray | Gray         | Input placeholders      |
| `secondary`           | Teal        | Lighter gray | Secondary elements      |
| `primary`             | Green       | Green        | Primary brand (static)  |
| `accent`              | Blue        | Blue         | Accents (static)        |
| `success`             | Green       | Green        | Success states (static) |
| `warning`             | Orange      | Orange       | Warning states (static) |
| `danger`              | Red         | Red          | Error states (static)   |

## Performance

- `useThemedStyles()` uses `useMemo` internally - styles only recreate when theme changes
- `useThemedColors()` is lightweight - just returns the current theme's color palette
- No performance penalty compared to the old approach

## TypeScript Support

All hooks are fully typed with TypeScript:

```tsx
import { useThemedColors, type SemanticColor, type ResolvedColors } from '@/components/theme';

// Colors object is fully typed
const colors: ResolvedColors = useThemedColors();

// Semantic color names are type-checked
const color: SemanticColor = 'secondary'; // ✅ Valid
const invalid: SemanticColor = 'purple'; // ❌ Type error
```

## When to Still Use `useTheme()`

You only need the original `useTheme()` hook if you need:

- `setTheme()` function (to change theme programmatically)
- `toggleTheme()` function (to cycle through themes)
- `theme` value (to check if it's 'system', 'light', or 'dark')

For just getting colors or checking `isDark`, use the new hooks instead!

## Summary

✅ **DO**: Use `useThemedColors()` or `useThemedStyles()` for theme-aware styling
✅ **DO**: Use semantic color names like `colors.secondary`, `colors.background`
✅ **DO**: Let the hooks handle light/dark mode logic automatically

❌ **DON'T**: Import `useTheme()` just to check `isDark` and pick colors
❌ **DON'T**: Manually check theme and select from `COLORS.dark` or `COLORS.light`
❌ **DON'T**: Create conditional ternaries for every color selection
