import { useBirdImage } from '@/hooks/useBirdImage';
import { BirdNNET } from '@/utils/birdnetTypes';
import { Flex } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { Spacer } from '@/components/ui/Spacer';
import { ImageContainer } from '@/components/ui/ImageContainer';
import { Confidence } from '@/components/ui/Confidence';

interface Props {
  result: BirdNNET;
}

export const Result = ({ result }: Props) => {
  const { imageUrl, isLoading } = useBirdImage(`${result.species}_${result.commonName}`);
  const testId = `result-item-${result.commonName.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <Flex paddingTop="none" paddingBottom="md" testID={testId}>
      <Flex flexDirection="column" alignItems="flex-start" justifyContent="flex-start">
        <Text variant="h1" color="secondary" weight="bold">
          {result.commonName.replace(/_/g, ' : ')}
        </Text>
      </Flex>

      <Confidence
        confidence={result.confidence}
        size="lg"
        showLabel={true}
        testID={`confidence-${result.commonName.toLowerCase().replace(/\s+/g, '-')}`}
      />

      <Spacer size="xs" />

      <ImageContainer
        source={imageUrl || undefined}
        isLoading={isLoading}
        accessibilityLabel={`Photo of ${result.commonName}`}
        aspectRatio={1}
        borderRadius="md"
        testID={`result-image-${result.commonName.toLowerCase().replace(/\s+/g, '-')}`}
      />
    </Flex>
  );
};
