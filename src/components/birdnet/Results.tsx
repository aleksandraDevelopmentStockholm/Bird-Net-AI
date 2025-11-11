import { BirdNNET } from '@/utils/birdnetTypes';
import { Flex } from '@/components/ui/Layout';
import { Text } from '@/components/ui/Text';
import { Result } from '@/components/birdnet/Result';
import { useWindowDimensions, View, StyleSheet } from 'react-native';

interface ResultsProps {
  results: BirdNNET[];
}

export function Results({ results }: ResultsProps) {
  const { width } = useWindowDimensions();

  // Responsive breakpoints
  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;

  // Determine number of columns based on screen size
  const numColumns = isDesktop ? 3 : isTablet ? 2 : 1;

  const speciesCount = results.length;
  const speciesText = speciesCount === 1 ? '1 species found' : `${speciesCount} species found`;

  return (
    <Flex
      accessible={true}
      accessibilityLabel={`Bird detection results. Found ${results.length} species`}
      testID="results-container"
    >
      <Text
        variant="body"
        color="secondary"
        weight="medium"
        testID="results-count"
        style={styles.speciesCount}
      >
        {speciesText}
      </Text>
      <View style={[styles.gridContainer, { maxWidth: isDesktop ? 1200 : '100%' }]}>
        {results.map((result, index) => (
          <View
            key={index}
            style={[styles.gridItem, { width: numColumns > 1 ? `${100 / numColumns}%` : '100%' }]}
          >
            <Result result={result} />
          </View>
        ))}
      </View>
    </Flex>
  );
}

const styles = StyleSheet.create({
  speciesCount: {
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    alignSelf: 'center',
  },
  gridItem: {
    padding: 8,
  },
});
