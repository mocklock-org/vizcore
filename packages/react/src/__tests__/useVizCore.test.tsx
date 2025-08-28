import React from 'react';
import { renderHook } from '@testing-library/react';
import { useVizCore } from '../hooks/useVizCore';
import { VizCoreProvider } from '../context/VizCoreContext';
import { VizCore } from '@vizcore/core';

jest.mock('@vizcore/core', () => ({
  VizCore: {
    create: jest.fn()
  }
}));

const createWrapper = (core?: any) => {
  return ({ children }: { children: React.ReactNode }) => (
    <VizCoreProvider core={core}>
      {children}
    </VizCoreProvider>
  );
};

describe('useVizCore', () => {
  const mockCore = {
    registerProcessor: jest.fn(),
    processData: jest.fn(),
    getMemoryStats: jest.fn(),
    getPerformanceMetrics: jest.fn(),
    destroy: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (VizCore.create as jest.Mock).mockReturnValue(mockCore);
  });

  it('should return core methods and state', () => {
    const wrapper = createWrapper(mockCore);
    const { result } = renderHook(() => useVizCore(), { wrapper });

    expect(result.current.core).toBe(mockCore);
    expect(result.current.isReady).toBe(true);
    expect(result.current.error).toBe(null);
    expect(typeof result.current.registerProcessor).toBe('function');
    expect(typeof result.current.processData).toBe('function');
    expect(typeof result.current.getMemoryStats).toBe('function');
    expect(typeof result.current.getPerformanceMetrics).toBe('function');
  });

  it('should call registerProcessor on core', async () => {
    const wrapper = createWrapper(mockCore);
    const { result } = renderHook(() => useVizCore(), { wrapper });

    const processor = { name: 'test', process: jest.fn(), validate: jest.fn(), getSchema: jest.fn() };
    await result.current.registerProcessor(processor);

    expect(mockCore.registerProcessor).toHaveBeenCalledWith(processor);
  });

  it('should call processData on core', async () => {
    const wrapper = createWrapper(mockCore);
    const { result } = renderHook(() => useVizCore(), { wrapper });

    mockCore.processData.mockResolvedValue({ result: 'test' });

    const data = await result.current.processData('test-processor', 'test-data');

    expect(mockCore.processData).toHaveBeenCalledWith('test-processor', 'test-data');
    expect(data).toEqual({ result: 'test' });
  });

  it('should call getMemoryStats on core', () => {
    const mockStats = { used: 100, available: 900, threshold: 0.8, warnings: [] };
    mockCore.getMemoryStats.mockReturnValue(mockStats);

    const wrapper = createWrapper(mockCore);
    const { result } = renderHook(() => useVizCore(), { wrapper });

    const stats = result.current.getMemoryStats();

    expect(mockCore.getMemoryStats).toHaveBeenCalled();
    expect(stats).toBe(mockStats);
  });

  it('should call getPerformanceMetrics on core', () => {
    const mockMetrics = [{ processingTime: 100, memoryUsage: 50, dataSize: 1000, timestamp: Date.now() }];
    mockCore.getPerformanceMetrics.mockReturnValue(mockMetrics);

    const wrapper = createWrapper(mockCore);
    const { result } = renderHook(() => useVizCore(), { wrapper });

    const metrics = result.current.getPerformanceMetrics();

    expect(mockCore.getPerformanceMetrics).toHaveBeenCalled();
    expect(metrics).toBe(mockMetrics);
  });
});
