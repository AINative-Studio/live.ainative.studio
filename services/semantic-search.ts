export interface SemanticSearchResult {
  streamId: string;
  title: string;
  description: string;
  relevanceScore: number;
  matchReason: string;
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  interpretation: string | null;
  fallback?: boolean;
}

export const semanticSearchService = {
  /**
   * Search streams using semantic/natural-language understanding.
   * Falls back gracefully if the service is unavailable.
   */
  async searchStreams(query: string): Promise<SemanticSearchResponse> {
    const res = await fetch('/api/search/semantic', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      // If the service signals fallback, return empty results instead of throwing
      if (err.fallback) {
        return { results: [], interpretation: null, fallback: true };
      }
      throw new Error(err.error || 'Semantic search failed');
    }

    return res.json();
  },
};
