import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ElectoralDataStats {
  total_records: number;
  has_data: boolean;
  election_years: number[];
  departments: string[];
  total_votes: number;
  message: string;
}

interface CleaningOptions {
  handleNulls: boolean;
  normalizeData: boolean;
  encodeCategories: boolean;
  removeDuplicates: boolean;
}

interface ModelConfig {
  modelType: string;
  isProcessing: boolean;
  isComplete: boolean;
}

interface DataContextType {
  electoralDataStats: ElectoralDataStats | null;
  setElectoralDataStats: (data: ElectoralDataStats | null) => void;
  cleaningOptions: CleaningOptions;
  setCleaningOptions: (options: CleaningOptions) => void;
  modelConfig: ModelConfig;
  setModelConfig: (config: ModelConfig) => void;
  resetData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [electoralDataStats, setElectoralDataStats] = useState<ElectoralDataStats | null>(null);
  const [cleaningOptions, setCleaningOptions] = useState<CleaningOptions>({
    handleNulls: false,
    normalizeData: false,
    encodeCategories: false,
    removeDuplicates: false,
  });
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    modelType: '',
    isProcessing: false,
    isComplete: false,
  });

  const resetData = () => {
    setElectoralDataStats(null);
    setCleaningOptions({
      handleNulls: false,
      normalizeData: false,
      encodeCategories: false,
      removeDuplicates: false,
    });
    setModelConfig({
      modelType: '',
      isProcessing: false,
      isComplete: false,
    });
  };

  return (
    <DataContext.Provider
      value={{
        electoralDataStats,
        setElectoralDataStats,
        cleaningOptions,
        setCleaningOptions,
        modelConfig,
        setModelConfig,
        resetData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useDataContext = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
};
