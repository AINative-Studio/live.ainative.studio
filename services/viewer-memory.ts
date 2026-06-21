/**
 * Client-side service for viewer memory persistence.
 * Calls the server-side /api/memory route which proxies to ZeroMemory.
 */

interface MemoryResult {
  content: string;
  metadata?: Record<string, any>;
  similarity?: number;
}

interface RecallResponse {
  memories: MemoryResult[];
}

interface ProfileResponse {
  profile: {
    summary?: string;
    interests?: string[];
    topics?: string[];
  } | null;
}

async function memoryRequest(body: Record<string, any>) {
  try {
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error('Memory request failed:', res.status);
      return null;
    }

    return res.json();
  } catch (err) {
    console.error('Memory request error:', err);
    return null;
  }
}

export const viewerMemoryService = {
  /**
   * Store that a user watched a specific stream.
   */
  async rememberStreamView(
    userId: string,
    streamId: string,
    streamTitle: string,
    language?: string
  ): Promise<void> {
    const content = `Watched stream "${streamTitle}"${language ? ` (${language})` : ''}`;
    await memoryRequest({
      action: 'remember',
      entityId: userId,
      content,
      metadata: {
        type: 'stream_view',
        streamId,
        streamTitle,
        language: language || null,
        timestamp: new Date().toISOString(),
      },
    });
  },

  /**
   * Recall relevant memories for AI context enrichment.
   */
  async recallContext(
    userId: string,
    query: string,
    limit = 5
  ): Promise<MemoryResult[]> {
    const data: RecallResponse | null = await memoryRequest({
      action: 'recall',
      entityId: userId,
      query,
      limit,
    });

    return data?.memories || [];
  },

  /**
   * Get the auto-generated viewer profile from ZeroMemory.
   */
  async getViewerProfile(userId: string): Promise<ProfileResponse['profile']> {
    const data: ProfileResponse | null = await memoryRequest({
      action: 'profile',
      entityId: userId,
    });

    return data?.profile || null;
  },
};
