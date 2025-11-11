import { BirdNNET } from '@/utils/birdnetTypes';
import { Flex } from '@/components/ui/Layout';
import { Result } from '@/components/birdnet/Result';

interface ResultsProps {
  results: BirdNNET[];
}

export function SavedRecordings({ results }: ResultsProps) {
  return (
    <Flex
      accessible={true}
      accessibilityLabel={`Bird detection results. Found ${results.length} species`}
      testID="results-container"
    >
      {results.map((result, index) => (
        <Result key={index} result={result} />
      ))}
    </Flex>
  );
}
