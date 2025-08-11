# VizCore

A powerful, extensible data visualization and processing framework with built-in performance monitoring and memory management.

## Overview

VizCore is a TypeScript-based framework designed to handle data processing workloads with enterprise-grade features including:

- **Plugin Architecture**: Extensible system for custom data processors and visualizations
- **Memory Management**: Automatic memory allocation tracking with configurable limits and warnings
- **Performance Monitoring**: Built-in metrics collection for processing times and resource usage
- **Type Safety**: Full TypeScript support with comprehensive interfaces
- **Configuration Management**: Flexible configuration system with sensible defaults

## Key Features

### Plugin System
- Register custom data processors and visualization plugins
- Lifecycle management with initialization and cleanup
- Plugin isolation and error handling

### Memory Management
- Automatic memory usage tracking
- Configurable memory limits (default: 200MB)
- Warning thresholds to prevent memory issues
- Memory allocation/deallocation API

### Performance Monitoring
- Real-time performance metrics collection
- Configurable sampling rates
- Processing time and memory usage tracking
- Historical metrics storage

### Configuration
- Centralized configuration management
- Runtime configuration updates
- Environment-specific defaults
- Type-safe configuration schema

## Quick Start

```typescript
import { VizCore } from '@vizcore/core';

// Create instance with default configuration
const core = VizCore.create();

// Or with custom configuration
const core = VizCore.create({
  memory: {
    maxSize: 500 * 1024 * 1024, // 500MB
    warningThreshold: 0.9
  },
  performance: {
    enableMonitoring: true,
    sampleRate: 0.8
  }
});

// Register a data processor
core.registerProcessor({
  name: 'csv-parser',
  validate: (data) => typeof data === 'string',
  process: async (data) => {
    // Your CSV parsing logic
    return parsedData;
  },
  getSchema: () => ({
    fields: [
      { name: 'id', type: 'number' },
      { name: 'name', type: 'string' }
    ]
  })
});

// Process data
const result = await core.processData('csv-parser', csvString);

// Monitor performance
const metrics = core.getPerformanceMetrics();
const memoryStats = core.getMemoryStats();
```

## Architecture

### Core Components

- **VizCore**: Main orchestrator class that coordinates all subsystems
- **ConfigManager**: Handles configuration management and updates
- **MemoryManager**: Tracks and manages memory allocation
- **PerformanceMonitor**: Collects and stores performance metrics
- **PluginRegistry**: Manages plugin lifecycle and registration

### Data Flow

1. **Configuration**: Initialize VizCore with user configuration
2. **Registration**: Register plugins and data processors
3. **Processing**: Process data through registered processors with automatic monitoring
4. **Monitoring**: Collect performance metrics and memory usage
5. **Cleanup**: Proper resource cleanup and plugin destruction

## Configuration Options

```typescript
interface VizCoreConfig {
  plugins: string[];           // List of plugins to auto-load
  memory: {
    maxSize: number;          // Maximum memory usage (bytes)
    warningThreshold: number; // Warning threshold (0.0-1.0)
  };
  performance: {
    enableMonitoring: boolean; // Enable performance tracking
    sampleRate: number;       // Sampling rate (0.0-1.0)
  };
}
```

## API Reference

### Main Methods

- `registerPlugin(plugin: Plugin)` - Register a visualization plugin
- `registerProcessor(processor: DataProcessor)` - Register a data processor
- `processData<T>(processorName: string, data: unknown)` - Process data with monitoring
- `getMemoryStats()` - Get current memory usage statistics
- `getPerformanceMetrics()` - Get performance metrics history
- `allocateMemory(id: string, size: number)` - Manually allocate memory
- `deallocateMemory(id: string)` - Manually deallocate memory

### Monitoring

```typescript
// Memory statistics
const memoryStats = core.getMemoryStats();
console.log(`Memory used: ${memoryStats.used} bytes`);
console.log(`Memory available: ${memoryStats.available} bytes`);
console.log(`Warnings: ${memoryStats.warnings.length}`);

// Performance metrics
const metrics = core.getPerformanceMetrics();
metrics.forEach(metric => {
  console.log(`Processing time: ${metric.processingTime}ms`);
  console.log(`Memory usage: ${metric.memoryUsage} bytes`);
});
```

## Plugin Development

Create custom plugins by implementing the `Plugin` interface:

```typescript
const myPlugin: Plugin = {
  name: 'my-visualization-plugin',
  version: '1.0.0',
  initialize: async (core: VizCore) => {
    // Plugin initialization logic
    console.log('Plugin initialized');
  },
  destroy: async () => {
    // Cleanup logic
    console.log('Plugin destroyed');
  }
};

await core.registerPlugin(myPlugin);
```

## Data Processor Development

Create custom data processors by implementing the `DataProcessor` interface:

```typescript
const myProcessor: DataProcessor<ParsedData> = {
  name: 'json-parser',
  validate: (data) => {
    return typeof data === 'string' && data.trim().startsWith('{');
  },
  process: async (data: string) => {
    return JSON.parse(data);
  },
  getSchema: () => ({
    fields: [
      { name: 'id', type: 'string' },
      { name: 'value', type: 'number' }
    ]
  })
};

core.registerProcessor(myProcessor);
```

## Best Practices

1. **Memory Management**: Always monitor memory usage in production environments
2. **Error Handling**: Implement proper error handling in plugins and processors
3. **Performance**: Use appropriate sampling rates for performance monitoring
4. **Configuration**: Use environment-specific configurations
5. **Cleanup**: Always call `destroy()` when shutting down the application

## License

See [LICENSE](../../LICENSE) file for details.
