import { useCallback } from 'react';
import { DataProcessor } from '@vizcore/core';
import { useVizCoreContext } from '../context/VizCoreContext';
import { UseVizCoreReturn } from '../types';

export const useVizCore = (): UseVizCoreReturn => {
  const { core, isReady, error } = useVizCoreContext();

  const registerProcessor = useCallback(async (processor: DataProcessor) => {
    if (!core) {
      throw new Error('VizCore is not initialized');
    }
    core.registerProcessor(processor);
  }, [core]);

  const processData = useCallback(async <T>(processorName: string, data: unknown): Promise<T> => {
    if (!core) {
      throw new Error('VizCore is not initialized');
    }
    return await core.processData<T>(processorName, data);
  }, [core]);

  const getMemoryStats = useCallback(() => {
    if (!core) return null;
    return core.getMemoryStats();
  }, [core]);

  const getPerformanceMetrics = useCallback(() => {
    if (!core) return [];
    return core.getPerformanceMetrics();
  }, [core]);

  return {
    core,
    isReady,
    error,
    registerProcessor,
    processData,
    getMemoryStats,
    getPerformanceMetrics
  };
};
