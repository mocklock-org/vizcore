import { VizCoreConfig } from '../interfaces/types';

export const DEFAULT_CONFIG: VizCoreConfig = {
  plugins: [],
  memory: {
    maxSize: 200 * 1024 * 1024,
    warningThreshold: 0.8
  },
  performance: {
    enableMonitoring: true,
    sampleRate: 1.0
  }
};
