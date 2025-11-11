import { Flex } from '@/components/ui/Layout';
import { List } from '@/components/ui/List';
import { Text } from '@/components/ui/Text';

export function Instructions() {
  return (
    <Flex testID="instructions" padding="sm" flexDirection="column">
      <Text weight="bold" variant="h1">
        How to use
      </Text>
      <List
        variant="h3"
        color="secondary"
        ordered={true}
        text={[
          'Find a location with clear bird sounds',
          'Tap the microphone to start recording',
          'Record for 5-15 seconds',
          'Wait for AI analysis results',
        ]}
      />
    </Flex>
  );
}
