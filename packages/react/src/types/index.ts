import { ReactNode } from 'react';
import { VizCore, VizCoreConfig, MemoryStats, PerformanceMetrics, DataProcessor } from '@vizcore/core';

export interface VizCoreProviderProps {
  children: ReactNode;
  config?: Partial<VizCoreConfig>;
  core?: VizCore;
}

export interface UseDataUploadOptions {
  processor?: string;
  onSuccess?: (result: any) => void;
  onError?: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

export interface DataUploadState {
  isUploading: boolean;
  progress: number;
  error: Error | null;
  result: any | null;
}

export interface UseSystemMetricsOptions {
  refreshInterval?: number;
  enableAutoRefresh?: boolean;
}

export interface SystemMetricsState {
  memory: MemoryStats | null;
  performance: PerformanceMetrics[];
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
}

export interface UseVizCoreReturn {
  core: VizCore | null;
  isReady: boolean;
  error: Error | null;
  registerProcessor: (processor: DataProcessor) => Promise<void>;
  processData: <T>(processorName: string, data: unknown) => Promise<T>;
  getMemoryStats: () => MemoryStats | null;
  getPerformanceMetrics: () => PerformanceMetrics[];
}

export interface VizCoreContextValue {
  core: VizCore | null;
  isReady: boolean;
  error: Error | null;
}

export interface ProcessorInfo {
  name: string;
  isRegistered: boolean;
  schema?: any;
}

// Hook return types for better TypeScript experience
export type DataUploadHook = [
  (data: File | string | unknown, options?: UseDataUploadOptions) => Promise<void>,
  DataUploadState
];

export type SystemMetricsHook = [
  SystemMetricsState,
  {
    refresh: () => Promise<void>;
    startAutoRefresh: () => void;
    stopAutoRefresh: () => void;
  }
];
