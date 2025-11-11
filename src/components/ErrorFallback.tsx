import { ScrollView } from 'react-native';
import { SafeArea, Flex } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { ErrorDisplay } from '@/components/birdnet/ErrorDisplay';
import { Spacer } from '@/components/ui/Spacer';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <SafeArea accessible={true} accessibilityRole="none" accessibilityLabel="Error screen">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <Flex
          padding="lg"
          flex={1}
          justifyContent="center"
          accessible={true}
          accessibilityRole="text"
          accessibilityLabel="An unexpected error occurred. The app encountered an error but your recordings are safe. Use the Try Again button to continue."
        >
          <Text variant="h1" color="primary" weight="bold">
            Oops! Something went wrong
          </Text>

          <Spacer size="md" />

          <Text variant="body" color="secondary">
            The app encountered an unexpected error. Don&apos;t worry - your recordings are safe.
          </Text>

          <Spacer size="lg" />

          <Button
            variant="primary"
            size="lg"
            onPress={resetErrorBoundary}
            text="Try Again"
            fullWidth={true}
            testID="error-boundary-reset-button"
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Try again"
            accessibilityHint="Double tap to reset the app and try again"
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          />

          {__DEV__ && (
            <>
              <Spacer size="lg" />
              <ErrorDisplay
                message={`${error.name}: ${error.message}`}
                testID="error-boundary-details"
              />
            </>
          )}
        </Flex>
      </ScrollView>
    </SafeArea>
  );
}
