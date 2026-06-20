export interface AiAskResponse {
  answer: string;
  sources?: string[];
}

export interface AiStreamSummaryResponse {
  summary: string;
  topics: string[];
  currentActivity: string;
}

export interface AiExplainResponse {
  explanation: string;
}

export interface StreamContext {
  streamTitle?: string;
  streamLanguage?: string;
  streamDescription?: string;
}

export const aiChatService = {
  /**
   * Ask the AI about the current stream's code
   */
  async askQuestion(
    _streamId: string,
    question: string,
    context?: StreamContext
  ): Promise<AiAskResponse> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        streamTitle: context?.streamTitle,
        streamLanguage: context?.streamLanguage,
        streamDescription: context?.streamDescription,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Failed to get AI response');
    }

    return res.json();
  },

  /**
   * Get AI-generated summary of what's happening in the stream
   */
  async getStreamSummary(
    _streamId: string,
    context?: StreamContext
  ): Promise<AiStreamSummaryResponse> {
    const res = await fetch('/api/ai/summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamTitle: context?.streamTitle || 'Live Stream',
        streamLanguage: context?.streamLanguage,
        streamDescription: context?.streamDescription,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Failed to get AI summary');
    }

    return res.json();
  },

  /**
   * Explain a code snippet shared in chat
   */
  async explainCode(
    _streamId: string,
    code: string,
    language?: string,
    context?: StreamContext
  ): Promise<AiExplainResponse> {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        streamTitle: context?.streamTitle,
        streamLanguage: language || context?.streamLanguage,
        streamDescription: context?.streamDescription,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(err.error || 'Failed to explain code');
    }

    const data = await res.json();
    return { explanation: data.answer };
  },
};
