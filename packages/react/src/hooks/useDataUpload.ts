import { useState, useCallback } from 'react';
import { useVizCore } from './useVizCore';
import { UseDataUploadOptions, DataUploadState, DataUploadHook } from '../types';

export const useDataUpload = (): DataUploadHook => {
  const { processData, isReady } = useVizCore();
  
  const [state, setState] = useState<DataUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    result: null
  });

  const uploadData = useCallback(async (
    data: File | string | unknown,
    options: UseDataUploadOptions = {}
  ) => {
    if (!isReady) {
      throw new Error('VizCore is not ready');
    }

    const {
      processor = 'default',
      onSuccess,
      onError,
      onProgress
    } = options;

    setState(prev => ({
      ...prev,
      isUploading: true,
      progress: 0,
      error: null,
      result: null
    }));

    try {
      if (data instanceof File) {
        onProgress?.(25);
        setState(prev => ({ ...prev, progress: 25 }));
        
        const text = await data.text();
        onProgress?.(50);
        setState(prev => ({ ...prev, progress: 50 }));
        
        const result = await processData(processor, text);
        onProgress?.(100);
        setState(prev => ({
          ...prev,
          progress: 100,
          result,
          isUploading: false
        }));
        
        onSuccess?.(result);
      } else {
        onProgress?.(50);
        setState(prev => ({ ...prev, progress: 50 }));
        
        const result = await processData(processor, data);
        onProgress?.(100);
        setState(prev => ({
          ...prev,
          progress: 100,
          result,
          isUploading: false
        }));
        
        onSuccess?.(result);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Upload failed');
      setState(prev => ({
        ...prev,
        error: err,
        isUploading: false,
        progress: 0
      }));
      onError?.(err);
    }
  }, [processData, isReady]);

  return [uploadData, state];
};
