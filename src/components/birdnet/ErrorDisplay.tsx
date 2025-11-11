import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/ui';
import { useThemedColors } from '@/components/theme';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/Text';

interface ErrorDisplayProps {
  message: string;
  testID?: string;
}

export function ErrorDisplay({ message, testID = 'error-display' }: ErrorDisplayProps) {
  const colors = useThemedColors();

  // Theme-aware background and border colors
  const backgroundColor = colors.isDark ? COLORS.danger + '20' : COLORS.danger + '10';
  const borderColor = colors.isDark ? COLORS.danger + '60' : COLORS.danger + '40';

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
      accessibilityLabel={`Error: ${message}`}
    >
      <MaterialIcons name="error-outline" size={24} color={COLORS.danger} style={styles.icon} />
      <View style={styles.textContainer}>
        <Text variant="body" color="danger" weight="semibold" testID={`${testID}-message`}>
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
