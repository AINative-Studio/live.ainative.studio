export interface StreamRecommendation {
  id: string;
  title: string;
  description: string;
  tags: string[];
  score: number;
}

export interface RecommendationsResponse {
  suggestions: StreamRecommendation[];
  source: 'graphrag' | 'tags';
}

export const recommendationsService = {
  /**
   * Get related stream recommendations based on current stream context
   */
  async getRelatedStreams(
    streamId: string,
    tags: string[]
  ): Promise<RecommendationsResponse> {
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamTitle: '',
        streamTags: tags,
        viewerHistory: [streamId],
      }),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch recommendations');
    }

    return res.json();
  },
};
