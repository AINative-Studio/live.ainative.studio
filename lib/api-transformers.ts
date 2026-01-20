import type { Stream } from '@/types';

/**
 * Backend API Response Types
 * These represent the actual field names returned by the backend API
 */
interface BackendStream {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: string;
  category_id: string | null;
  category: any | null;
  thumbnail_url: string | null;
  stream_key: string | null;
  cloudflare_stream_id: string | null; // Backend field name
  viewer_count: number;
  peak_viewers: number;
  tags: any[];
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  user: any;
}

/**
 * Transform backend stream response to frontend Stream type
 * Maps snake_case backend fields to camelCase frontend fields
 */
export function transformStream(backendStream: any): Stream {
  return {
    id: backendStream.id,
    userId: backendStream.user_id || backendStream.userId,
    title: backendStream.title,
    description: backendStream.description,
    status: backendStream.status,
    categoryId: backendStream.category_id || backendStream.categoryId,
    category: backendStream.category,
    thumbnailUrl: backendStream.thumbnail_url || backendStream.thumbnailUrl,
    streamKey: backendStream.stream_key || backendStream.streamKey,
    // Map cloudflare_stream_id to cloudflareVideoId
    cloudflareVideoId: backendStream.cloudflare_stream_id || backendStream.cloudflareVideoId,
    viewerCount: backendStream.viewer_count ?? backendStream.viewerCount ?? 0,
    peakViewers: backendStream.peak_viewers ?? backendStream.peakViewers ?? 0,
    tags: backendStream.tags || [],
    startedAt: backendStream.started_at || backendStream.startedAt,
    endedAt: backendStream.ended_at || backendStream.endedAt,
    createdAt: backendStream.created_at || backendStream.createdAt,
    user: backendStream.user,
  };
}

/**
 * Transform array of backend streams to frontend Stream types
 */
export function transformStreams(backendStreams: any[]): Stream[] {
  return backendStreams.map(transformStream);
}

/**
 * Transform backend response that contains a streams array
 */
export function transformStreamsResponse(response: any): { streams: Stream[]; total: number } {
  return {
    streams: transformStreams(response.streams || []),
    total: response.total || 0,
  };
}
