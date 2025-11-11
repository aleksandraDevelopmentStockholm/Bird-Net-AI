import { createContext, useContext, useState, useMemo, ReactNode } from 'react';

export interface RecordingContextType {
  recordedAudioUri: string | null;
  setRecordedAudioUri: (uri: string | null) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export function RecordingProvider({ children }: { children: ReactNode }) {
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      recordedAudioUri,
      setRecordedAudioUri,
    }),
    [recordedAudioUri, setRecordedAudioUri]
  );

  return <RecordingContext.Provider value={value}>{children}</RecordingContext.Provider>;
}

export function useRecordingContext() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error('useRecordingContext must be used within a RecordingProvider');
  }
  return context;
}
