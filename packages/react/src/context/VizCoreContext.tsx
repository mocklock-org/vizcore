import * as React from 'react';
import { VizCore } from '@vizcore/core';
import { VizCoreContextValue, VizCoreProviderProps } from '../types';

const VizCoreContext = React.createContext<VizCoreContextValue | undefined>(undefined);

export const VizCoreProvider: React.FC<VizCoreProviderProps> = ({ 
  children, 
  config = {},
  core: providedCore 
}) => {
  const [core, setCore] = React.useState<VizCore | null>(null);
  const [isReady, setIsReady] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const initializeCore = React.useCallback(async () => {
    try {
      setError(null);
      setIsReady(false);

      let coreInstance: VizCore;
      
      if (providedCore) {
        coreInstance = providedCore;
      } else {
        coreInstance = VizCore.create(config);
      }

      setCore(coreInstance);
      setIsReady(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize VizCore');
      setError(error);
      console.error('VizCore initialization failed:', error);
    }
  }, [config, providedCore]);

  React.useEffect(() => {
    initializeCore();

    return () => {
      if (core && !providedCore) {
        core.destroy?.();
      }
    };
  }, [initializeCore, core, providedCore]);

  const contextValue: VizCoreContextValue = {
    core,
    isReady,
    error
  };

  return (
    <VizCoreContext.Provider value={contextValue}>
      {children}
    </VizCoreContext.Provider>
  );
};

export const useVizCoreContext = (): VizCoreContextValue => {
  const context = React.useContext(VizCoreContext);
  
  if (context === undefined) {
    throw new Error('useVizCoreContext must be used within a VizCoreProvider');
  }
  
  return context;
};

export { VizCoreContext };
