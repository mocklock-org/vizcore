import { VizCoreConfig } from './interfaces/types';
import { DEFAULT_CONFIG } from './constants';

export class ConfigManager {
  private config: VizCoreConfig;

  constructor(userConfig: Partial<VizCoreConfig> = {}) {
    this.config = this.mergeConfig(DEFAULT_CONFIG, userConfig);
  }

  private mergeConfig(base: VizCoreConfig, override: Partial<VizCoreConfig>): VizCoreConfig {
    return {
      plugins: override.plugins ?? base.plugins,
      memory: {
        ...base.memory,
        ...override.memory
      },
      performance: {
        ...base.performance,
        ...override.performance
      }
    };
  }

  getConfig(): VizCoreConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<VizCoreConfig>): void {
    this.config = this.mergeConfig(this.config, updates);
  }

  getMemoryConfig() {
    return this.config.memory;
  }

  getPerformanceConfig() {
    return this.config.performance;
  }

  getPlugins() {
    return this.config.plugins;
  }
}
