import { Text } from '@/components/ui/Text';
import { SPACING } from '@/constants/ui';
import { useThemedColors } from '@/components/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export interface ListProps {
  variant?: 'small' | 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'white';
  text: string[];
  textAlign?: 'left' | 'center' | 'right';
  ordered?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string;
}

export const List: React.FC<ListProps> = ({
  color,
  variant = 'body',
  text,
  textAlign = 'left',
  ordered = false,
  accessible = true,
  accessibilityLabel,
}) => {
  const colors = useThemedColors();

  // Get theme-aware bullet color
  const bulletColor = colors.textMuted;

  return (
    <View
      style={styles.container}
      accessible={accessible}
      accessibilityRole="list"
      accessibilityLabel={accessibilityLabel || `List with ${text.length} items`}
    >
      {text.map((item, index) => (
        <View key={index} style={styles.listItem}>
          {ordered ? (
            <View style={styles.orderedItem}>
              <Text
                variant={variant}
                color={color}
                textAlign={textAlign}
                weight="bold"
                style={styles.number}
              >
                {index + 1}.
              </Text>
              <Text variant={variant} color={color} textAlign={textAlign} style={styles.itemText}>
                {item}
              </Text>
            </View>
          ) : (
            <View style={styles.unorderedItem}>
              <MaterialIcons
                name="circle"
                size={8}
                color={color ? undefined : bulletColor}
                style={styles.bullet}
              />
              <Text variant={variant} color={color} textAlign={textAlign} style={styles.itemText}>
                {item}
              </Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  listItem: {
    marginBottom: SPACING.sm,
  },
  orderedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  unorderedItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  number: {
    marginRight: SPACING.sm,
  },
  bullet: {
    marginRight: SPACING.sm,
    marginTop: 8,
  },
  itemText: {
    flex: 1,
  },
});
