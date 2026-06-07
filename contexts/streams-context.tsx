'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { streamsService } from '@/services/streams';
import type { Stream, Category } from '@/types';

interface StreamsContextType {
  trendingStreams: Stream[];
  risingStreams: Stream[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refreshTrending: () => Promise<void>;
  refreshRising: () => Promise<void>;
  refreshCategories: () => Promise<void>;
}

const StreamsContext = createContext<StreamsContextType | undefined>(undefined);

export function StreamsProvider({ children }: { children: React.ReactNode }) {
  const [trendingStreams, setTrendingStreams] = useState<Stream[]>([]);
  const [risingStreams, setRisingStreams] = useState<Stream[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTrending = useCallback(async () => {
    try {
      const response = await streamsService.getTrending(20);
      setTrendingStreams(response.streams);
      setError(null);
    } catch (err) {
      // Silent fallback — don't spam console on expected failures
      setTrendingStreams([]);
    }
  }, []);

  const refreshRising = useCallback(async () => {
    try {
      const response = await streamsService.getRising(20);
      setRisingStreams(response.streams);
      setError(null);
    } catch (err) {
      // Silent fallback — don't spam console on expected failures
      setRisingStreams([]);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const response = await streamsService.getCategories();
      setCategories(response);
      setError(null);
    } catch (err) {
      // Silent fallback — don't spam console on expected failures
      setCategories([]);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      await Promise.all([
        refreshTrending(),
        refreshRising(),
        refreshCategories(),
      ]);
      setIsLoading(false);
    };

    fetchInitialData();
  }, [refreshTrending, refreshRising, refreshCategories]);

  // Auto-refresh every 2 minutes (not 30s — avoids console spam when API is down)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTrending();
      refreshRising();
    }, 120000); // 2 minutes

    return () => clearInterval(interval);
  }, [refreshTrending, refreshRising]);

  return (
    <StreamsContext.Provider
      value={{
        trendingStreams,
        risingStreams,
        categories,
        isLoading,
        error,
        refreshTrending,
        refreshRising,
        refreshCategories,
      }}
    >
      {children}
    </StreamsContext.Provider>
  );
}

export function useStreams() {
  const context = useContext(StreamsContext);
  if (context === undefined) {
    throw new Error('useStreams must be used within a StreamsProvider');
  }
  return context;
}
