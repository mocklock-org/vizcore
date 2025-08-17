import { useState, useEffect, useCallback, useRef } from 'react';
import { useVizCore } from './useVizCore';
import { UseSystemMetricsOptions, SystemMetricsState, SystemMetricsHook } from '../types';

export const useSystemMetrics = (
  options: UseSystemMetricsOptions = {}
): SystemMetricsHook => {
  const { getMemoryStats, getPerformanceMetrics, isReady } = useVizCore();
  const {
    refreshInterval = 5000,
    enableAutoRefresh = false
  } = options;

  const [state, setState] = useState<SystemMetricsState>({
    memory: null,
    performance: [],
    isLoading: false,
    error: null,
    lastUpdated: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refresh = useCallback(async () => {
    if (!isReady) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const memory = getMemoryStats();
      const performance = getPerformanceMetrics();

      setState(prev => ({
        ...prev,
        memory,
        performance,
        isLoading: false,
        lastUpdated: new Date()
      }));
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to fetch metrics');
      setState(prev => ({
        ...prev,
        error: err,
        isLoading: false
      }));
    }
  }, [getMemoryStats, getPerformanceMetrics, isReady]);

  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(refresh, refreshInterval);
  }, [refresh, refreshInterval]);

  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isReady) {
      refresh();
    }
  }, [isReady, refresh]);

  useEffect(() => {
    if (enableAutoRefresh && isReady) {
      startAutoRefresh();
    } else {
      stopAutoRefresh();
    }

    return stopAutoRefresh;
  }, [enableAutoRefresh, isReady, startAutoRefresh, stopAutoRefresh]);

  useEffect(() => {
    return () => {
      stopAutoRefresh();
    };
  }, [stopAutoRefresh]);

  return [
    state,
    {
      refresh,
      startAutoRefresh,
      stopAutoRefresh
    }
  ];
};
