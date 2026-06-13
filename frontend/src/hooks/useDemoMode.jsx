import { createContext, useContext, useState, useCallback } from 'react';

const DemoModeContext = createContext();

export function DemoModeProvider({ children }) {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [failCount, setFailCount] = useState(0);

  const toggleDemoMode = useCallback(() => {
    setIsDemoMode(prev => !prev);
  }, []);

  const reportApiFailure = useCallback(() => {
    setFailCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setIsDemoMode(true);
        console.warn('[DemoMode] Auto-enabled after 3 consecutive API failures');
      }
      return next;
    });
  }, []);

  const reportApiSuccess = useCallback(() => {
    setFailCount(0);
  }, []);

  return (
    <DemoModeContext.Provider value={{
      isDemoMode,
      toggleDemoMode,
      reportApiFailure,
      reportApiSuccess,
      failCount,
    }}>
      {children}
    </DemoModeContext.Provider>
  );
}

export function useDemoMode() {
  const ctx = useContext(DemoModeContext);
  if (!ctx) throw new Error('useDemoMode must be used within DemoModeProvider');
  return ctx;
}
