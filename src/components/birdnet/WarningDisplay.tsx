import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/ui';
import { useThemedColors } from '@/components/theme';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';

interface WarningDisplayProps {
  message: string;
  testID?: string;
}

export function WarningDisplay({ message, testID = 'warning-display' }: WarningDisplayProps) {
  const colors = useThemedColors();

  // Theme-aware background and border colors
  const backgroundColor = colors.isDark ? COLORS.warning + '20' : COLORS.warning + '10';
  const borderColor = colors.isDark ? COLORS.warning + '60' : COLORS.warning + '40';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
      ]}
      testID={testID}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel={`Warning: ${message}`}
    >
      <MaterialIcons name="warning" size={24} color={COLORS.warning} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text variant="body" color="warning" weight="semibold" testID={`${testID}-message`}>
          {message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
});
