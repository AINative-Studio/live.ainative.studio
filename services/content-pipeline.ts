import apiClient from '@/lib/api-client';
import type { StreamContent } from '@/types';

export const contentPipelineService = {
  /** Get generated content for a stream/VOD */
  async getStreamContent(streamId: string): Promise<StreamContent> {
    return apiClient.get(`/streams/id/${streamId}/content`, true);
  },

  /** Generate blog post draft from stream transcript */
  async generateBlogDraft(streamId: string): Promise<StreamContent> {
    return apiClient.post(`/streams/id/${streamId}/content/blog`, {}, true);
  },

  /** Generate code snippets with explanations */
  async generateCodeSnippets(streamId: string): Promise<StreamContent> {
    return apiClient.post(`/streams/id/${streamId}/content/snippets`, {}, true);
  },

  /** Get/generate transcript */
  async getTranscript(streamId: string): Promise<StreamContent> {
    return apiClient.get(`/streams/id/${streamId}/transcript`, true);
  },

  /** Generate chapter markers */
  async generateChapters(streamId: string): Promise<StreamContent> {
    return apiClient.post(`/streams/id/${streamId}/content/chapters`, {}, true);
  },

  /** Export content in various formats */
  async exportContent(
    streamId: string,
    format: 'markdown' | 'html' | 'json'
  ): Promise<string> {
    return apiClient.get(
      `/streams/id/${streamId}/content/export?format=${format}`,
      true
    );
  },
};
