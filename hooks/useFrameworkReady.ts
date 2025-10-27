import { useEffect } from 'react';

declare global {
  interface Global {
    frameworkReady?: () => void;
  }
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    const maybeWindow = typeof window !== 'undefined' ? window : undefined;
    const maybeGlobal = typeof globalThis !== 'undefined' ? (globalThis as Global) : undefined;
    const frameworkReady = maybeWindow?.frameworkReady ?? maybeGlobal?.frameworkReady;

    if (typeof frameworkReady === 'function') {
      frameworkReady();
    }
  }, []);
}
