import express from 'express';
import cors from 'cors';
import { VizCore } from './vizcore';
import { MemoryManager } from './memory';
import { PerformanceMonitor } from './performance';

const app = express();
const PORT = process.env.PORT || 3000;

const vizcore = new VizCore();
const memoryManager = new MemoryManager();
const performanceMonitor = new PerformanceMonitor();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  try {
    const memoryStats = memoryManager.getStats();
    const performanceMetrics = performanceMonitor.getMetrics();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      memory: {
        used: memoryStats.used,
        available: memoryStats.available,
        threshold: memoryStats.threshold,
        percentage: Math.round((memoryStats.used / (memoryStats.used + memoryStats.available)) * 100)
      },
      performance: {
        averageProcessingTime: performanceMonitor.getAverageProcessingTime(),
        averageMemoryUsage: performanceMonitor.getAverageMemoryUsage(),
        metricsCount: performanceMetrics.length
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/ready', (req, res) => {
  try {
    const isReady = vizcore && memoryManager && performanceMonitor;
    
    if (isReady) {
      res.json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        components: {
          vizcore: !!vizcore,
          memoryManager: !!memoryManager,
          performanceMonitor: !!performanceMonitor
        }
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'VizCore',
    version: '0.1.0',
    description: 'A high-performance data visualization framework',
    endpoints: {
      health: '/health',
      ready: '/ready',
      api: '/api'
    }
  });
});

app.get('/api', (req, res) => {
  res.json({
    message: 'VizCore API',
    version: '0.1.0',
    status: 'active'
  });
});

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

const server = app.listen(PORT, () => {
  console.log(`VizCore server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Ready check: http://localhost:${PORT}/ready`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

export default app;
