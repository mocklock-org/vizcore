import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSystemMetrics } from '../hooks/useSystemMetrics';
import { VizCoreProvider } from '../context/VizCoreContext';
import { VizCore } from '@vizcore/core';

jest.mock('@vizcore/core', () => ({
  VizCore: {
    create: jest.fn()
  }
}));

jest.useFakeTimers();

const createWrapper = () => {
  const mockCore = {
    getMemoryStats: jest.fn(),
    getPerformanceMetrics: jest.fn(),
    destroy: jest.fn()
  };
  
  (VizCore.create as jest.Mock).mockReturnValue(mockCore);

  return {
    wrapper: ({ children }: { children: React.ReactNode }) => (
      <VizCoreProvider core={mockCore as any}>
        {children}
      </VizCoreProvider>
    ),
    mockCore
  };
};

describe('useSystemMetrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it('should fetch metrics on initial load', async () => {
    const { wrapper, mockCore } = createWrapper();
    const mockMemory = { used: 100, available: 900, threshold: 0.8, warnings: [] };
    const mockPerformance = [{ processingTime: 100, memoryUsage: 50, dataSize: 1000, timestamp: Date.now() }];

    mockCore.getMemoryStats.mockReturnValue(mockMemory);
    mockCore.getPerformanceMetrics.mockReturnValue(mockPerformance);

    const { result } = renderHook(() => useSystemMetrics(), { wrapper });

    await act(async () => {
      // Wait for initial load
    });

    const [state] = result.current;

    expect(mockCore.getMemoryStats).toHaveBeenCalled();
    expect(mockCore.getPerformanceMetrics).toHaveBeenCalled();
    expect(state.memory).toBe(mockMemory);
    expect(state.performance).toBe(mockPerformance);
    expect(state.lastUpdated).toBeInstanceOf(Date);
  });

  it('should refresh metrics manually', async () => {
    const { wrapper, mockCore } = createWrapper();
    const mockMemory = { used: 200, available: 800, threshold: 0.8, warnings: [] };

    mockCore.getMemoryStats.mockReturnValue(mockMemory);
    mockCore.getPerformanceMetrics.mockReturnValue([]);

    const { result } = renderHook(() => useSystemMetrics(), { wrapper });

    await act(async () => {
      const [, controls] = result.current;
      await controls.refresh();
    });

    const [state] = result.current;

    expect(state.memory).toBe(mockMemory);
    expect(mockCore.getMemoryStats).toHaveBeenCalled();
  });

  it('should handle errors during refresh', async () => {
    const { wrapper, mockCore } = createWrapper();
    const error = new Error('Metrics fetch failed');

    mockCore.getMemoryStats.mockImplementation(() => {
      throw error;
    });

    const { result } = renderHook(() => useSystemMetrics(), { wrapper });

    await act(async () => {
      const [, controls] = result.current;
      await controls.refresh();
    });

    const [state] = result.current;

    expect(state.error).toBe(error);
    expect(state.isLoading).toBe(false);
  });

  it('should stop auto refresh', async () => {
    const { wrapper, mockCore } = createWrapper();
    
    mockCore.getMemoryStats.mockReturnValue({ used: 100, available: 900, threshold: 0.8, warnings: [] });
    mockCore.getPerformanceMetrics.mockReturnValue([]);

    const { result } = renderHook(() => useSystemMetrics({ refreshInterval: 1000 }), { wrapper });

    await act(async () => {
      const [, controls] = result.current;
      controls.startAutoRefresh();
      jest.advanceTimersByTime(500);
      controls.stopAutoRefresh();
      jest.advanceTimersByTime(1000);
    });

    expect(mockCore.getMemoryStats).toHaveBeenCalledTimes(1);
  });

  it('should cleanup intervals on unmount', async () => {
    const { wrapper, mockCore } = createWrapper();
    
    mockCore.getMemoryStats.mockReturnValue({ used: 100, available: 900, threshold: 0.8, warnings: [] });
    mockCore.getPerformanceMetrics.mockReturnValue([]);

    const { result, unmount } = renderHook(() => useSystemMetrics({ 
      enableAutoRefresh: true, 
      refreshInterval: 1000 
    }), { wrapper });

    await act(async () => {
      const [, controls] = result.current;
      controls.startAutoRefresh();
    });

    unmount();

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(mockCore.getMemoryStats).toHaveBeenCalledTimes(1);
  });
});
