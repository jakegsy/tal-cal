import React, { createContext, useContext, useState, useCallback } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

interface CacheContextType {
  get: <T>(key: string) => T | null;
  set: <T>(key: string, data: T, expiresIn?: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

export const CacheContext = createContext<CacheContextType | null>(null);

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Record<string, CacheItem<any>>>({});

  const get = useCallback(<T,>(key: string): T | null => {
    const item = cache[key];
    if (!item) return null;

    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      // Remove expired item
      const newCache = { ...cache };
      delete newCache[key];
      setCache(newCache);
      return null;
    }

    return item.data;
  }, [cache]);

  const set = useCallback(<T,>(key: string, data: T, expiresIn: number = 5 * 60 * 1000) => {
    setCache(prev => ({
      ...prev,
      [key]: {
        data,
        timestamp: Date.now(),
        expiresIn,
      },
    }));
  }, []);

  const remove = useCallback((key: string) => {
    setCache(prev => {
      const newCache = { ...prev };
      delete newCache[key];
      return newCache;
    });
  }, []);

  const clear = useCallback(() => {
    setCache({});
  }, []);

  return (
    <CacheContext.Provider value={{ get, set, remove, clear }}>
      {children}
    </CacheContext.Provider>
  );
} 