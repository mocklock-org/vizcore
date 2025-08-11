export interface VizCoreConfig {
  plugins: string[];
  memory: {
    maxSize: number;
    warningThreshold: number;
  };
  performance: {
    enableMonitoring: boolean;
    sampleRate: number;
  };
}

export interface Plugin {
  name: string;
  version: string;
  initialize: (core: VizCore) => Promise<void>;
  destroy: () => Promise<void>;
}

export interface DataProcessor<T = any> {
  name: string;
  process: (data: unknown) => Promise<T>;
  validate: (data: unknown) => boolean;
  getSchema: () => DataSchema;
}

export interface DataSchema {
  fields: DataField[];
  rowCount?: number;
  estimatedSize?: number;
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'object';
  nullable?: boolean;
  unique?: boolean;
}

export interface MemoryStats {
  used: number;
  available: number;
  threshold: number;
  warnings: string[];
}

export interface PerformanceMetrics {
  processingTime: number;
  memoryUsage: number;
  dataSize: number;
  timestamp: number;
}

export interface VizCore {
  config: VizCoreConfig;
  plugins: Map<string, Plugin>;
  processors: Map<string, DataProcessor>;
  registerPlugin: (plugin: Plugin) => Promise<void>;
  registerProcessor: (processor: DataProcessor) => void;
  getMemoryStats: () => MemoryStats;
  getPerformanceMetrics: () => PerformanceMetrics[];
}
