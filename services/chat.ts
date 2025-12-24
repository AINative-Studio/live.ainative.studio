import apiClient from '@/lib/api-client';
import type { ChatMessage, ChatMessageCreate } from '@/types';

export const chatService = {
  /** Get chat messages for stream */
  async getMessages(streamId: string, limit: number = 50): Promise<ChatMessage[]> {
    return apiClient.get(`/streams/${streamId}/chat?limit=${limit}`);
  },

  /** Get chat history */
  async getHistory(streamId: string, before?: string, limit: number = 50): Promise<ChatMessage[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (before) params.append('before', before);
    return apiClient.get(`/streams/${streamId}/chat/history?${params.toString()}`);
  },

  /** Send chat message (requires auth) */
  async sendMessage(streamId: string, data: ChatMessageCreate): Promise<ChatMessage> {
    return apiClient.post(`/streams/${streamId}/chat`, data, true);
  },

  /** Delete message (requires auth - mod/owner only) */
  async deleteMessage(streamId: string, messageId: string): Promise<void> {
    return apiClient.delete(`/streams/${streamId}/chat/${messageId}`, true);
  },
};
