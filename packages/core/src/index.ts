export { VizCore } from './vizcore';
export { ConfigManager } from './config';
export { DEFAULT_CONFIG } from './constants';
export { MemoryManager } from './memory';
export { PerformanceMonitor, PerformanceMeasurement } from './performance';
export { PluginRegistry } from './plugin-registry';

export type {
  VizCoreConfig,
  Plugin,
  DataProcessor,
  DataSchema,
  DataField,
  MemoryStats,
  PerformanceMetrics,
  VizCore as IVizCore
} from './interfaces/types';

export { VizCore as default } from './vizcore';
