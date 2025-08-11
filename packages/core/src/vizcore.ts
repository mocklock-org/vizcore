import { VizCore as IVizCore, VizCoreConfig, Plugin, DataProcessor, MemoryStats, PerformanceMetrics } from './interfaces/types';
import { ConfigManager } from './config';
import { MemoryManager } from './memory';
import { PerformanceMonitor } from './performance';
import { PluginRegistry } from './plugin-registry';

export class VizCore implements IVizCore {
  public readonly config: VizCoreConfig;
  public readonly plugins: Map<string, Plugin>;
  public readonly processors: Map<string, DataProcessor>;

  private configManager: ConfigManager;
  private memoryManager: MemoryManager;
  private performanceMonitor: PerformanceMonitor;
  private pluginRegistry: PluginRegistry;

  constructor(userConfig: Partial<VizCoreConfig> = {}) {
    this.configManager = new ConfigManager(userConfig);
    this.config = this.configManager.getConfig();

    const memoryConfig = this.configManager.getMemoryConfig();
    this.memoryManager = new MemoryManager(memoryConfig.maxSize, memoryConfig.warningThreshold);

    const perfConfig = this.configManager.getPerformanceConfig();
    this.performanceMonitor = new PerformanceMonitor(perfConfig.enableMonitoring, perfConfig.sampleRate);

    this.pluginRegistry = new PluginRegistry();
    this.plugins = this.pluginRegistry['plugins'];
    this.processors = this.pluginRegistry['processors'];
  }

  async registerPlugin(plugin: Plugin): Promise<void> {
    await this.pluginRegistry.registerPlugin(plugin);
  }

  registerProcessor(processor: DataProcessor): void {
    this.pluginRegistry.registerProcessor(processor);
  }

  getMemoryStats(): MemoryStats {
    return this.memoryManager.getStats();
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return this.performanceMonitor.getMetrics();
  }

  async processData<T>(processorName: string, data: unknown): Promise<T> {
    const processor = this.pluginRegistry.getProcessor(processorName);
    if (!processor) {
      throw new Error(`Processor ${processorName} not found`);
    }

    if (!processor.validate(data)) {
      throw new Error(`Data validation failed for processor ${processorName}`);
    }

    const measurement = this.performanceMonitor.startMeasurement(`process-${processorName}`);
    const dataSize = this.memoryManager.estimateObjectSize(data);
    
    try {
      const result = await processor.process(data);
      const resultSize = this.memoryManager.estimateObjectSize(result);
      
      measurement.end(dataSize, resultSize);
      return result;
    } catch (error) {
      measurement.end(dataSize, 0);
      throw error;
    }
  }

  allocateMemory(id: string, size: number): boolean {
    return this.memoryManager.allocate(id, size);
  }

  deallocateMemory(id: string): void {
    this.memoryManager.deallocate(id);
  }

  clearPerformanceMetrics(): void {
    this.performanceMonitor.clearMetrics();
  }

  clearMemoryWarnings(): void {
    this.memoryManager.clearWarnings();
  }

  async destroy(): Promise<void> {
    await this.pluginRegistry.destroyAll();
  }

  static create(config?: Partial<VizCoreConfig>): VizCore {
    return new VizCore(config);
  }
}
