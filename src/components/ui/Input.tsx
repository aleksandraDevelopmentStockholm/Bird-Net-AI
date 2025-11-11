import { useThemedColors } from '@/components/theme';
import React from 'react';
import {
  SPACING,
  BORDER_RADIUS,
  COLORS,
  FONT_SIZES,
  FONT_WEIGHTS,
  BORDER_WIDTHS,
  OPACITY,
} from '@/constants/ui';
import { View, TextInput, Text, StyleSheet } from 'react-native';

export interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export const Input: React.FC<InputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  disabled = false,
  multiline = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => {
  const colors = useThemedColors();

  const inputStyles = [
    styles.input,
    {
      borderColor: error ? COLORS.danger : colors.border,
      backgroundColor: colors.background,
      color: colors.text,
      opacity: disabled ? OPACITY.inactive : OPACITY.full,
    },
  ];

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        editable={!disabled}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={inputStyles}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: parseInt(FONT_SIZES.caption), // Semantic: labels are captions
    fontWeight: FONT_WEIGHTS.semibold,
    marginBottom: SPACING.sm,
  },
  input: {
    borderWidth: parseInt(BORDER_WIDTHS.thin),
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    fontSize: parseInt(FONT_SIZES.body), // Was .md, now using semantic name
  },
  error: {
    fontSize: parseInt(FONT_SIZES.caption), // 14px for readability (was xs/12px)
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});
