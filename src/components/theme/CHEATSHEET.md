# Theme System Cheat Sheet

## Quick Import

```tsx
import { useThemedColors, useThemedStyles } from '@/components/theme';
```

## Common Patterns

### 1. Inline Styles (Simplest)

```tsx
function MyComponent() {
  const colors = useThemedColors();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.secondary }}>Hello</Text>
    </View>
  );
}
```

### 2. StyleSheet (Best Performance)

```tsx
function MyComponent() {
  const styles = useThemedStyles((colors) => ({
    container: { backgroundColor: colors.background },
    text: { color: colors.secondary },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
}
```

### 3. Conditional Styles

```tsx
function MyComponent({ isActive }) {
  const colors = useThemedColors();

  return (
    <View
      style={{
        backgroundColor: isActive ? colors.primary : colors.background,
        borderColor: colors.border,
      }}
    >
      ...
    </View>
  );
}
```

## Available Colors

```tsx
const colors = useThemedColors();

// Theme-aware (change with dark mode)
colors.background; // Main background
colors.backgroundSecondary; // Secondary background
colors.text; // Primary text
colors.textSecondary; // Secondary text
colors.textMuted; // Muted text
colors.border; // Borders
colors.card; // Cards
colors.placeholder; // Placeholders
colors.secondary; // Secondary brand

// Static (same in light/dark)
colors.primary; // Primary brand
colors.accent; // Accent
colors.success; // Success
colors.warning; // Warning
colors.danger; // Danger
colors.white; // White
colors.black; // Black
colors.transparent; // Transparent
```

## Migration Quick Win

**Replace this:**

```tsx
const { isDark } = useTheme();
const bgColor = isDark ? COLORS.dark.background : COLORS.light.background;
```

**With this:**

```tsx
const colors = useThemedColors();
const bgColor = colors.background;
```

## Tips

✅ Use `useThemedColors()` for simple inline styles
✅ Use `useThemedStyles()` for StyleSheet.create patterns
✅ Colors automatically update when theme changes
✅ No performance penalty vs. manual approach
✅ Full TypeScript support

❌ Don't use `useTheme()` just for colors anymore
❌ Don't manually check `isDark` to pick colors
❌ Don't import from `COLORS.dark` or `COLORS.light` directly
