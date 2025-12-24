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
      console.error('Failed to fetch trending streams:', err);
      setError('Failed to load trending streams');
      // Gracefully fall back to empty array
      setTrendingStreams([]);
    }
  }, []);

  const refreshRising = useCallback(async () => {
    try {
      const response = await streamsService.getRising(20);
      setRisingStreams(response.streams);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch rising streams:', err);
      setError('Failed to load rising streams');
      // Gracefully fall back to empty array
      setRisingStreams([]);
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const response = await streamsService.getCategories();
      setCategories(response);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
      // Gracefully fall back to empty array
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

  // Set up 30-second auto-refresh interval
  useEffect(() => {
    const interval = setInterval(() => {
      refreshTrending();
      refreshRising();
      // Categories don't change as frequently, so we skip them in auto-refresh
    }, 30000); // 30 seconds

    // Clean up interval on unmount
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
