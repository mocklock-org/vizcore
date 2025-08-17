# @vizcore/react

React components and hooks for VizCore - a powerful data visualization framework.

## Installation

> **Note**: This package is currently in development and depends on the local `@vizcore/core` package. Make sure to build the core package first.

```bash
# In the monorepo root
npm run bootstrap
npm run build

# Or build core specifically
cd packages/core && npm run build
```

For production use (once published):
```bash
npm install @vizcore/react @vizcore/core react react-dom
```

## Quick Start

### 1. Wrap your app with VizCoreProvider

```tsx
import React from 'react';
import { VizCoreProvider } from '@vizcore/react';

function App() {
  return (
    <VizCoreProvider
      config={{
        memory: {
          maxSize: 500 * 1024 * 1024, // 500MB
          warningThreshold: 0.9
        },
        performance: {
          enableMonitoring: true,
          sampleRate: 0.8
        }
      }}
    >
      <Dashboard />
    </VizCoreProvider>
  );
}
```

### 2. Use hooks in your components

```tsx
import React from 'react';
import { useVizCore, useDataUpload, useSystemMetrics } from '@vizcore/react';

function Dashboard() {
  const { isReady, registerProcessor } = useVizCore();
  const [uploadData, uploadState] = useDataUpload();
  const [metrics, metricsControls] = useSystemMetrics({
    enableAutoRefresh: true,
    refreshInterval: 5000
  });

  // Register a CSV processor
  React.useEffect(() => {
    if (isReady) {
      registerProcessor({
        name: 'csv-parser',
        validate: (data) => typeof data === 'string',
        process: async (data) => {
          // Your CSV parsing logic
          return { rows: data.split('\n').map(row => row.split(',')) };
        },
        getSchema: () => ({
          fields: [
            { name: 'id', type: 'number' },
            { name: 'name', type: 'string' }
          ]
        })
      });
    }
  }, [isReady, registerProcessor]);

  const handleFileUpload = (file: File) => {
    uploadData(file, {
      processor: 'csv-parser',
      onSuccess: (result) => console.log('Upload successful:', result),
      onError: (error) => console.error('Upload failed:', error),
      onProgress: (progress) => console.log('Progress:', progress)
    });
  };

  return (
    <div>
      <h1>VizCore Dashboard</h1>
      
      {/* File Upload */}
      <div>
        <input
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
          accept=".csv,.json"
        />
        {uploadState.isUploading && (
          <div>Uploading... {uploadState.progress}%</div>
        )}
        {uploadState.error && (
          <div>Error: {uploadState.error.message}</div>
        )}
      </div>

      {/* System Metrics */}
      <div>
        <h2>System Metrics</h2>
        <button onClick={metricsControls.refresh}>Refresh Metrics</button>
        
        {metrics.memory && (
          <div>
            <p>Memory Used: {metrics.memory.used} bytes</p>
            <p>Memory Available: {metrics.memory.available} bytes</p>
            <p>Warnings: {metrics.memory.warnings.length}</p>
          </div>
        )}
        
        {metrics.performance.length > 0 && (
          <div>
            <p>Recent Performance:</p>
            <ul>
              {metrics.performance.slice(-5).map((perf, index) => (
                <li key={index}>
                  Processing Time: {perf.processingTime}ms, 
                  Memory: {perf.memoryUsage} bytes
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
```

## API Reference

### Components

#### VizCoreProvider

The main provider component that initializes VizCore and makes it available to child components.

**Props:**
- `children: ReactNode` - Child components
- `config?: Partial<VizCoreConfig>` - VizCore configuration
- `core?: VizCore` - Pre-initialized VizCore instance (optional)

### Hooks

#### useVizCore()

Main hook for accessing VizCore functionality.

**Returns:**
- `core: VizCore | null` - VizCore instance
- `isReady: boolean` - Whether VizCore is initialized
- `error: Error | null` - Initialization error if any
- `registerProcessor: (processor: DataProcessor) => Promise<void>` - Register data processor
- `processData: <T>(processorName: string, data: unknown) => Promise<T>` - Process data
- `getMemoryStats: () => MemoryStats | null` - Get memory statistics
- `getPerformanceMetrics: () => PerformanceMetrics[]` - Get performance metrics

#### useDataUpload()

Hook for handling data uploads with progress tracking.

**Returns:** `[uploadData, state]`
- `uploadData: (data: File | string | unknown, options?: UseDataUploadOptions) => Promise<void>`
- `state: DataUploadState` - Upload state with progress, error, and result

**Options:**
- `processor?: string` - Processor name (default: 'default')
- `onSuccess?: (result: any) => void` - Success callback
- `onError?: (error: Error) => void` - Error callback
- `onProgress?: (progress: number) => void` - Progress callback

#### useSystemMetrics(options?)

Hook for monitoring system metrics with auto-refresh capability.

**Options:**
- `refreshInterval?: number` - Refresh interval in ms (default: 5000)
- `enableAutoRefresh?: boolean` - Enable automatic refresh (default: false)

**Returns:** `[state, controls]`
- `state: SystemMetricsState` - Current metrics state
- `controls` - Control functions:
  - `refresh: () => Promise<void>` - Manual refresh
  - `startAutoRefresh: () => void` - Start auto refresh
  - `stopAutoRefresh: () => void` - Stop auto refresh

## TypeScript Support

This package is written in TypeScript and provides full type definitions. All hooks and components are fully typed for the best developer experience.

```tsx
import type { 
  VizCoreProviderProps,
  UseDataUploadOptions,
  DataUploadState,
  SystemMetricsState 
} from '@vizcore/react';
```

## Examples

### Custom Data Processor

```tsx
import React from 'react';
import { useVizCore } from '@vizcore/react';

function CustomProcessor() {
  const { registerProcessor, isReady } = useVizCore();

  React.useEffect(() => {
    if (isReady) {
      registerProcessor({
        name: 'json-parser',
        validate: (data) => {
          try {
            JSON.parse(data as string);
            return true;
          } catch {
            return false;
          }
        },
        process: async (data) => {
          const parsed = JSON.parse(data as string);
          return {
            data: parsed,
            count: Array.isArray(parsed) ? parsed.length : 1
          };
        },
        getSchema: () => ({
          fields: [
            { name: 'data', type: 'object' },
            { name: 'count', type: 'number' }
          ]
        })
      });
    }
  }, [isReady, registerProcessor]);

  return <div>Custom processor registered!</div>;
}
```

### Memory Monitoring

```tsx
import React from 'react';
import { useSystemMetrics } from '@vizcore/react';

function MemoryMonitor() {
  const [metrics] = useSystemMetrics({
    enableAutoRefresh: true,
    refreshInterval: 2000
  });

  if (!metrics.memory) return <div>Loading metrics...</div>;

  const usagePercent = (metrics.memory.used / (metrics.memory.used + metrics.memory.available)) * 100;

  return (
    <div>
      <h3>Memory Usage</h3>
      <div style={{ 
        width: '100%', 
        height: '20px', 
        backgroundColor: '#f0f0f0',
        borderRadius: '10px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${usagePercent}%`,
          height: '100%',
          backgroundColor: usagePercent > 80 ? '#ff4444' : '#44ff44',
          transition: 'width 0.3s ease'
        }} />
      </div>
      <p>{usagePercent.toFixed(1)}% used</p>
      {metrics.memory.warnings.length > 0 && (
        <div style={{ color: 'orange' }}>
          Warnings: {metrics.memory.warnings.join(', ')}
        </div>
      )}
    </div>
  );
}
```

## Testing

The package includes comprehensive tests using Jest and React Testing Library. Run tests with:

```bash
npm test
```

## License

MIT
