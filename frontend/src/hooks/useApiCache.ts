import { useState, useEffect, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  isLoading: boolean;
  error: string | null;
}

interface UseApiCacheOptions {
  cacheTime?: number; // Cache duration in milliseconds
  staleTime?: number; // Time before data is considered stale
  retry?: number; // Number of retry attempts
}

export function useApiCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: UseApiCacheOptions = {}
) {
  const {
    cacheTime = 10 * 60 * 1000, // 10 minutes
    staleTime = 5 * 60 * 1000,  // 5 minutes
    retry = 3
  } = options;

  const [cache, setCache] = useState<Map<string, CacheEntry<T>>>(new Map());
  const retryCountRef = useRef(0);

  const getCachedData = () => {
    const cached = cache.get(key);
    if (!cached) return null;
    
    const now = Date.now();
    const isExpired = now - cached.timestamp > cacheTime;
    const isStale = now - cached.timestamp > staleTime;
    
    if (isExpired) {
      cache.delete(key);
      return null;
    }
    
    return { ...cached, isStale };
  };

  const fetchData = async () => {
    const cached = getCachedData();
    
    if (cached && !cached.isStale) {
      return cached;
    }

    setCache(prev => new Map(prev).set(key, {
      data: cached?.data || null as T,
      timestamp: cached?.timestamp || 0,
      isLoading: true,
      error: null
    }));

    try {
      const data = await fetcher();
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        isLoading: false,
        error: null
      };
      
      setCache(prev => new Map(prev).set(key, entry));
      retryCountRef.current = 0;
      return entry;
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => fetchData(), Math.pow(2, retryCountRef.current) * 1000);
      } else {
        setCache(prev => new Map(prev).set(key, {
          data: cached?.data || null as T,
          timestamp: cached?.timestamp || 0,
          isLoading: false,
          error: errorMessage
        }));
      }
      
      throw error;
    }
  };

  const invalidateCache = () => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  };

  useEffect(() => {
    fetchData();
  }, [key]);

  const cachedEntry = getCachedData();
  
  return {
    data: cachedEntry?.data || null,
    isLoading: cachedEntry?.isLoading || false,
    error: cachedEntry?.error || null,
    isStale: cachedEntry?.isStale || false,
    refetch: fetchData,
    invalidate: invalidateCache
  };
}
