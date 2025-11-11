import { Text } from '@/components/ui/Text';
import { Flex } from '@/components/ui/Layout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { COLORS } from '@/constants/ui';

interface ConfidenceProps {
  confidence: number; // 0-1 range
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  testID?: string;
}

export function Confidence({ confidence, showLabel = true, size = 'md', testID }: ConfidenceProps) {
  const percentage = Math.round(confidence * 100);

  // Determine color based on confidence level
  const getConfidenceColor = () => {
    if (percentage >= 80) return COLORS.success;
    if (percentage >= 50) return COLORS.warning;
    return COLORS.danger;
  };

  // Determine label text
  const getConfidenceLabel = () => {
    if (percentage >= 80) return 'High';
    if (percentage >= 50) return 'Medium';
    return 'Low';
  };

  const confidenceColor = getConfidenceColor();

  return (
    <Flex
      flexDirection="row"
      alignItems="center"
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel={`Confidence: ${percentage}%, ${getConfidenceLabel()}`}
      testID={testID}
    >
      {/* Progress bar */}
      <ProgressBar
        progress={percentage}
        size={size}
        variant="rounded"
        color={confidenceColor}
        flex={true}
      />

      {/* Percentage text */}
      <Text
        variant={size === 'lg' ? 'h2' : size === 'md' ? 'body' : 'small'}
        weight="bold"
        style={{ color: confidenceColor }}
      >
        {percentage}%
      </Text>

      {/* Optional label */}
      {showLabel && (
        <Text variant={size === 'lg' ? 'h2' : 'small'} color="secondary" weight="bold">
          {getConfidenceLabel()}
        </Text>
      )}
    </Flex>
  );
}

// Styles removed - now using ProgressBar component
