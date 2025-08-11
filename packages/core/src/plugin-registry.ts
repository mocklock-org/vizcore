import { Plugin, DataProcessor } from './interfaces/types';

export class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private processors: Map<string, DataProcessor> = new Map();

  async registerPlugin(plugin: Plugin): Promise<void> {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`Plugin ${plugin.name} is already registered`);
    }

    try {
      await plugin.initialize(this as any);
      this.plugins.set(plugin.name, plugin);
    } catch (error) {
      throw new Error(`Failed to initialize plugin ${plugin.name}: ${error}`);
    }
  }

  async unregisterPlugin(name: string): Promise<void> {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin ${name} is not registered`);
    }

    try {
      await plugin.destroy();
      this.plugins.delete(name);
    } catch (error) {
      console.warn(`Error destroying plugin ${name}:`, error);
      this.plugins.delete(name);
    }
  }

  registerProcessor(processor: DataProcessor): void {
    if (this.processors.has(processor.name)) {
      throw new Error(`Processor ${processor.name} is already registered`);
    }
    this.processors.set(processor.name, processor);
  }

  unregisterProcessor(name: string): void {
    this.processors.delete(name);
  }

  getPlugin(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  getProcessor(name: string): DataProcessor | undefined {
    return this.processors.get(name);
  }

  getAllPlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  getAllProcessors(): DataProcessor[] {
    return Array.from(this.processors.values());
  }

  async destroyAll(): Promise<void> {
    const destroyPromises = Array.from(this.plugins.values()).map(plugin => 
      plugin.destroy().catch(error => 
        console.warn(`Error destroying plugin ${plugin.name}:`, error)
      )
    );
    
    await Promise.all(destroyPromises);
    this.plugins.clear();
    this.processors.clear();
  }
}
