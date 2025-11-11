import { useThemedColors } from '@/components/theme';
import { COLORS, LAYOUT, SHADOWS, SPACING } from '@/constants/ui';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';

export interface LayoutProps {
  children: React.ReactNode;
  variant?: 'container' | 'grid' | 'flex' | 'card' | 'section';
  themeAware?: boolean;
  backgroundColor?: 'none' | 'primary' | 'secondary' | 'white' | 'transparent';
  borderRadius?: number;
  // Flex properties
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flex?: number;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  paddingTop?: 'none' | 'sm' | 'md' | 'lg';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg';
  paddingLeft?: 'none' | 'sm' | 'md' | 'lg';
  paddingRight?: 'none' | 'sm' | 'md' | 'lg';
  minHeight?: number;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?:
    | 'button'
    | 'header'
    | 'image'
    | 'link'
    | 'list'
    | 'none'
    | 'search'
    | 'summary'
    | 'progressbar'
    | 'text';
  testID?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  variant = 'container',
  themeAware = true,
  backgroundColor: bgColorProp,
  borderRadius,
  flexDirection,
  justifyContent,
  alignItems,
  alignContent,
  flexWrap,
  flex,
  padding,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  minHeight,
  accessible,
  accessibilityLabel,
  accessibilityRole,
  testID,
}) => {
  const colors = useThemedColors();

  // Get predefined background color
  const getPredefinedBackgroundColor = (color: string) => {
    switch (color) {
      case 'primary':
        // Using rgba format for better React Native compatibility
        return 'rgba(87, 166, 39, 0.2)'; // Primary color with 20% opacity
      case 'secondary':
        // Converting #144650 to rgba
        return 'rgba(20, 70, 80, 0.2)'; // Secondary color with 20% opacity
      case 'white':
        return COLORS.white;
      case 'transparent':
        return COLORS.transparent;
      case 'none':
      default:
        return undefined;
    }
  };

  // Get theme-aware background color
  const getBackgroundColor = () => {
    // If backgroundColor prop is provided, use it (takes priority over everything)
    if (bgColorProp !== undefined) {
      const predefinedColor = getPredefinedBackgroundColor(bgColorProp);
      // Return the predefined color even if it's undefined (for 'none')
      return predefinedColor;
    }

    if (!themeAware) return COLORS.transparent;

    switch (variant) {
      case 'card':
        return colors.isDark ? COLORS.dark.card : COLORS.light.card;
      case 'container':
        return colors.isDark ? COLORS.dark.background : COLORS.light.background;
      case 'section':
        return colors.isDark ? COLORS.dark.backgroundSecondary : COLORS.light.backgroundSecondary;
      case 'grid':
      case 'flex':
        // Grid and Flex remain transparent by default unless explicitly styled
        return COLORS.transparent;
      default:
        return COLORS.transparent;
    }
  };

  const backgroundColor = getBackgroundColor();

  const paddingValues = {
    none: 0,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
  };

  const getVariantStyles = () => {
    const baseStyles = [];

    baseStyles.push({ backgroundColor });

    // Apply general padding: custom prop takes precedence over variant default
    const generalPadding =
      padding !== undefined
        ? paddingValues[padding]
        : LAYOUT[variant as keyof typeof LAYOUT]?.padding;

    if (generalPadding !== undefined) {
      baseStyles.push({ padding: generalPadding });
    }

    // Apply specific padding overrides (these override general padding)
    if (paddingTop !== undefined) {
      baseStyles.push({ paddingTop: paddingValues[paddingTop] });
    }
    if (paddingBottom !== undefined) {
      baseStyles.push({ paddingBottom: paddingValues[paddingBottom] });
    }
    if (paddingLeft !== undefined) {
      baseStyles.push({ paddingLeft: paddingValues[paddingLeft] });
    }
    if (paddingRight !== undefined) {
      baseStyles.push({ paddingRight: paddingValues[paddingRight] });
    }

    if (minHeight !== undefined) {
      baseStyles.push({ minHeight });
    }

    switch (variant) {
      case 'container':
        return [
          styles.container,
          ...baseStyles,
          borderRadius !== undefined && { borderRadius },
          flex !== undefined && { flex },
          flexDirection && { flexDirection },
          justifyContent && { justifyContent },
          alignItems && { alignItems },
          alignContent && { alignContent },
          flexWrap && { flexWrap },
        ];

      case 'card':
        return [
          styles.card,
          ...baseStyles,
          // Theme-aware shadow
          {
            shadowOpacity: colors.isDark ? 0.4 : SHADOWS.card.shadowOpacity,
            shadowColor: colors.isDark ? COLORS.black : SHADOWS.card.shadowColor,
          },
        ];

      case 'section':
        return [styles.section, ...baseStyles];

      case 'flex':
        return [
          styles.flex,
          ...baseStyles,
          borderRadius !== undefined && { borderRadius },
          flex !== undefined && { flex },
          flexDirection && { flexDirection },
          justifyContent && { justifyContent },
          alignItems && { alignItems },
          alignContent && { alignContent },
          flexWrap && { flexWrap },
        ];

      case 'grid':
        return [styles.grid, ...baseStyles];

      default:
        return [styles.container, ...baseStyles, borderRadius !== undefined && { borderRadius }];
    }
  };

  return (
    <View
      style={getVariantStyles()}
      {...(accessible && { accessible })}
      {...(accessibilityLabel && { accessibilityLabel })}
      {...(accessibilityRole && { accessibilityRole })}
      {...(testID && { testID })}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    borderRadius: LAYOUT.card.borderRadius,
    marginBottom: SPACING.md,
    shadowColor: SHADOWS.card.shadowColor,
    shadowOffset: SHADOWS.card.shadowOffset,
    shadowOpacity: SHADOWS.card.shadowOpacity,
    shadowRadius: SHADOWS.card.shadowRadius,
    elevation: SHADOWS.card.elevation,
  },
  section: {
    marginBottom: LAYOUT.section.marginBottom,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.grid.gap,
    marginBottom: SPACING.md,
  },
  flex: {
    flexDirection: 'column',
    gap: SPACING.sm,
  },
});

export const Card: React.FC<Omit<LayoutProps, 'variant'>> = (props) => (
  <Layout variant="card" {...props} />
);

export const Section: React.FC<Omit<LayoutProps, 'variant'>> = (props) => (
  <Layout variant="section" {...props} />
);

export const Container: React.FC<Omit<LayoutProps, 'variant'>> = (props) => (
  <Layout variant="container" {...props} />
);

export const Grid: React.FC<Omit<LayoutProps, 'variant'>> = (props) => (
  <Layout variant="grid" {...props} />
);

export const Flex: React.FC<Omit<LayoutProps, 'variant'>> = (props) => (
  <Layout variant="flex" {...props} />
);

// SafeArea component interface
export interface SafeAreaProps {
  children: React.ReactNode;
  edges?: Edge[];
  themeAware?: boolean;
  backgroundColor?: 'none' | 'primary' | 'secondary' | 'white' | 'transparent';
  // Flex properties
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  alignContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'stretch'
    | 'space-between'
    | 'space-around';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  flex?: number;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  paddingTop?: 'none' | 'sm' | 'md' | 'lg';
  paddingBottom?: 'none' | 'sm' | 'md' | 'lg';
  paddingLeft?: 'none' | 'sm' | 'md' | 'lg';
  paddingRight?: 'none' | 'sm' | 'md' | 'lg';
  borderRadius?: number;
  minHeight?: number;
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?:
    | 'button'
    | 'header'
    | 'image'
    | 'link'
    | 'list'
    | 'none'
    | 'search'
    | 'summary'
    | 'progressbar'
    | 'text';
  testID?: string;
}

export const SafeArea: React.FC<SafeAreaProps> = ({
  children,
  edges = ['top', 'bottom', 'left', 'right'],
  themeAware = true,
  backgroundColor: bgColorProp,
  flexDirection,
  justifyContent,
  alignItems,
  alignContent,
  flexWrap,
  flex = 1,
  padding,
  paddingTop,
  paddingBottom,
  paddingLeft,
  paddingRight,
  borderRadius,
  minHeight,
  accessible,
  accessibilityLabel,
  accessibilityRole,
  testID,
}) => {
  const colors = useThemedColors();

  // Get predefined background color
  const getPredefinedBackgroundColor = (color: string) => {
    switch (color) {
      case 'primary':
        return 'rgba(87, 166, 39, 0.2)';
      case 'secondary':
        return 'rgba(20, 70, 80, 0.2)';
      case 'white':
        return COLORS.white;
      case 'transparent':
        return COLORS.transparent;
      case 'none':
      default:
        return undefined;
    }
  };

  // Get theme-aware background color
  const getBackgroundColor = () => {
    if (bgColorProp !== undefined) {
      return getPredefinedBackgroundColor(bgColorProp);
    }

    if (!themeAware) return COLORS.transparent;

    return colors.isDark ? COLORS.dark.background : COLORS.light.background;
  };

  const backgroundColor = getBackgroundColor();

  const paddingValues = {
    none: 0,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
  };

  const getSafeAreaStyles = () => {
    const baseStyles = [];

    baseStyles.push({ backgroundColor });
    baseStyles.push({ flex });

    // Apply general padding
    const generalPadding = padding !== undefined ? paddingValues[padding] : undefined;
    if (generalPadding !== undefined) {
      baseStyles.push({ padding: generalPadding });
    }

    // Apply specific padding overrides
    if (paddingTop !== undefined) {
      baseStyles.push({ paddingTop: paddingValues[paddingTop] });
    }
    if (paddingBottom !== undefined) {
      baseStyles.push({ paddingBottom: paddingValues[paddingBottom] });
    }
    if (paddingLeft !== undefined) {
      baseStyles.push({ paddingLeft: paddingValues[paddingLeft] });
    }
    if (paddingRight !== undefined) {
      baseStyles.push({ paddingRight: paddingValues[paddingRight] });
    }

    if (minHeight !== undefined) {
      baseStyles.push({ minHeight });
    }

    return [
      ...baseStyles,
      borderRadius !== undefined && { borderRadius },
      flexDirection && { flexDirection },
      justifyContent && { justifyContent },
      alignItems && { alignItems },
      alignContent && { alignContent },
      flexWrap && { flexWrap },
    ];
  };

  return (
    <SafeAreaView
      edges={edges}
      style={getSafeAreaStyles()}
      {...(accessible && { accessible })}
      {...(accessibilityLabel && { accessibilityLabel })}
      {...(accessibilityRole && { accessibilityRole })}
      {...(testID && { testID })}
    >
      {children}
    </SafeAreaView>
  );
};

export default Layout;
