import apiClient from '@/lib/api-client';

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

export const aiChatService = {
  /**
   * Ask the AI about the current stream's code
   */
  async askQuestion(streamId: string, question: string): Promise<AiAskResponse> {
    return apiClient.post<AiAskResponse>(
      `/streams/id/${streamId}/ai/ask`,
      { question },
      true
    );
  },

  /**
   * Get AI-generated summary of what's happening in the stream
   */
  async getStreamSummary(streamId: string): Promise<AiStreamSummaryResponse> {
    return apiClient.get<AiStreamSummaryResponse>(
      `/streams/id/${streamId}/ai/summary`
    );
  },

  /**
   * Explain a code snippet shared in chat
   */
  async explainCode(streamId: string, code: string, language?: string): Promise<AiExplainResponse> {
    return apiClient.post<AiExplainResponse>(
      `/streams/id/${streamId}/ai/explain`,
      { code, language },
      true
    );
  },
};
