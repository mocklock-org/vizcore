import { VizCore } from '../vizcore';
import { DataProcessor } from '../interfaces/types';

describe('VizCore', () => {
  let core: VizCore;

  beforeEach(() => {
    core = VizCore.create();
  });

  afterEach(async () => {
    await core.destroy();
  });

  test('should create VizCore instance with default config', () => {
    expect(core).toBeDefined();
    expect(core.config).toBeDefined();
    expect(core.plugins).toBeDefined();
    expect(core.processors).toBeDefined();
  });

  test('should register and use a data processor', async () => {
    const mockProcessor: DataProcessor<any> = {
      name: 'test-processor',
      validate: (data) => typeof data === 'string',
      process: async (data: unknown) => ({ processed: (data as string).toUpperCase() }),
      getSchema: () => ({ fields: [] })
    };

    core.registerProcessor(mockProcessor);
    
    const result = await core.processData('test-processor', 'hello');
    expect(result).toEqual({ processed: 'HELLO' });
  });

  test('should track memory stats', () => {
    const stats = core.getMemoryStats();
    expect(stats).toHaveProperty('used');
    expect(stats).toHaveProperty('available');
    expect(stats).toHaveProperty('threshold');
    expect(stats).toHaveProperty('warnings');
  });

  test('should track performance metrics', async () => {
    const mockProcessor: DataProcessor<any> = {
      name: 'perf-test',
      validate: () => true,
      process: async (data) => data,
      getSchema: () => ({ fields: [] })
    };

    core.registerProcessor(mockProcessor);
    await core.processData('perf-test', 'test-data');
    
    const metrics = core.getPerformanceMetrics();
    expect(Array.isArray(metrics)).toBe(true);
  });
});
