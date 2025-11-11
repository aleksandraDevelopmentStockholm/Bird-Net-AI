import { Text } from '@/components/ui/Text';
import { Badge } from '@/components/ui/Badge';
import { SPACING } from '@/constants/ui';
import { Flex } from '@/components/ui/Layout';

export function Header() {
  return (
    <Flex
      flexDirection="row"
      alignItems="center"
      justifyContent="flex-start"
      accessible={true}
      accessibilityRole="header"
      accessibilityLabel="BirdNet - Identify birds by sound"
    >
      <Badge
        source={require('@/assets/images/bird-icon-white.svg')}
        accessibilityLabel="Bird icon"
        style={{ marginRight: SPACING.md }}
      />
      <Flex flexDirection="column" alignItems="flex-start">
        <Text testID="header-title" variant="h1" textAlign="left" weight="bold" color="primary">
          BirdNet
        </Text>
      </Flex>
    </Flex>
  );
}
