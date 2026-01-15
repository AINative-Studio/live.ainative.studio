import { chatService } from '../chat';
import apiClient from '@/lib/api-client';
import type { ChatMessage, ChatMessageCreate } from '@/types';

// Mock the API client
jest.mock('@/lib/api-client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Chat Service', () => {
  const mockStreamId = 'test-stream-123';

  const mockMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      streamId: mockStreamId,
      userId: 'user-1',
      username: 'user1',
      displayName: 'User One',
      avatar: null,
      content: 'Hello world!',
      messageType: 'chat',
      badges: [],
      isDeleted: false,
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 'msg-2',
      streamId: mockStreamId,
      userId: 'user-2',
      username: 'user2',
      displayName: 'User Two',
      avatar: null,
      content: 'Hey there!',
      messageType: 'chat',
      badges: [],
      isDeleted: false,
      createdAt: '2024-01-01T12:01:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMessages', () => {
    it('should fetch chat messages for a stream', async () => {
      // Given mock messages
      (apiClient.get as jest.Mock).mockResolvedValue(mockMessages);

      // When fetching messages
      const result = await chatService.getMessages(mockStreamId);

      // Then it should call the API with correct endpoint
      expect(apiClient.get).toHaveBeenCalledWith(
        `/streams/${mockStreamId}/chat?limit=50`
      );
      expect(result).toEqual(mockMessages);
    });

    it('should fetch messages with custom limit', async () => {
      // Given a custom limit
      (apiClient.get as jest.Mock).mockResolvedValue(mockMessages);

      // When fetching messages with limit
      await chatService.getMessages(mockStreamId, 25);

      // Then it should include the limit in the query
      expect(apiClient.get).toHaveBeenCalledWith(
        `/streams/${mockStreamId}/chat?limit=25`
      );
    });

    it('should use default limit of 50', async () => {
      // Given no limit specified
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      // When fetching messages
      await chatService.getMessages(mockStreamId);

      // Then it should use default limit
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('limit=50')
      );
    });

    it('should handle empty message list', async () => {
      // Given no messages
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      // When fetching messages
      const result = await chatService.getMessages(mockStreamId);

      // Then it should return empty array
      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      // Given API error
      const error = new Error('Network error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      // When fetching messages
      // Then it should throw the error
      await expect(chatService.getMessages(mockStreamId)).rejects.toThrow(
        'Network error'
      );
    });
  });

  describe('getHistory', () => {
    it('should fetch chat history for a stream', async () => {
      // Given mock history
      (apiClient.get as jest.Mock).mockResolvedValue(mockMessages);

      // When fetching history
      const result = await chatService.getHistory(mockStreamId);

      // Then it should call the API with correct endpoint
      expect(apiClient.get).toHaveBeenCalledWith(
        `/streams/${mockStreamId}/chat/history?limit=50`
      );
      expect(result).toEqual(mockMessages);
    });

    it('should fetch history with before parameter', async () => {
      // Given a before timestamp
      const beforeTimestamp = '2024-01-01T12:00:00Z';
      (apiClient.get as jest.Mock).mockResolvedValue(mockMessages);

      // When fetching history with before
      await chatService.getHistory(mockStreamId, beforeTimestamp);

      // Then it should include before in the query
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`/streams/${mockStreamId}/chat/history?limit=50&before=`)
      );
    });

    it('should fetch history with custom limit', async () => {
      // Given a custom limit
      (apiClient.get as jest.Mock).mockResolvedValue(mockMessages);

      // When fetching history with limit
      await chatService.getHistory(mockStreamId, undefined, 100);

      // Then it should include the limit in the query
      expect(apiClient.get).toHaveBeenCalledWith(
        `/streams/${mockStreamId}/chat/history?limit=100`
      );
    });

    it('should fetch history with both before and limit', async () => {
      // Given before and limit
      const beforeTimestamp = '2024-01-01T12:00:00Z';
      (apiClient.get as jest.Mock).mockResolvedValue(mockMessages);

      // When fetching history
      await chatService.getHistory(mockStreamId, beforeTimestamp, 25);

      // Then it should include both parameters
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`/streams/${mockStreamId}/chat/history?limit=25&before=`)
      );
    });

    it('should handle empty history', async () => {
      // Given no history
      (apiClient.get as jest.Mock).mockResolvedValue([]);

      // When fetching history
      const result = await chatService.getHistory(mockStreamId);

      // Then it should return empty array
      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      // Given API error
      const error = new Error('Server error');
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      // When fetching history
      // Then it should throw the error
      await expect(chatService.getHistory(mockStreamId)).rejects.toThrow(
        'Server error'
      );
    });
  });

  describe('sendMessage', () => {
    it('should send a chat message', async () => {
      // Given message data
      const messageData: ChatMessageCreate = {
        content: 'Hello from test!',
      };
      const createdMessage: ChatMessage = {
        id: 'msg-new',
        streamId: mockStreamId,
        userId: 'current-user',
        username: 'testuser',
        displayName: 'Test User',
        avatar: null,
        content: messageData.content,
        messageType: 'chat',
        badges: [],
        isDeleted: false,
        createdAt: '2024-01-01T12:05:00Z',
      };
      (apiClient.post as jest.Mock).mockResolvedValue(createdMessage);

      // When sending a message
      const result = await chatService.sendMessage(mockStreamId, messageData);

      // Then it should call the API with correct parameters
      expect(apiClient.post).toHaveBeenCalledWith(
        `/streams/${mockStreamId}/chat`,
        messageData,
        true // authenticated
      );
      expect(result).toEqual(createdMessage);
    });

    it('should require authentication for sending messages', async () => {
      // Given message data
      const messageData: ChatMessageCreate = {
        content: 'Test message',
      };

      // When sending a message
      await chatService.sendMessage(mockStreamId, messageData);

      // Then it should pass authenticated=true
      expect(apiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Object),
        true
      );
    });

    it('should handle sending message with special characters', async () => {
      // Given message with special characters
      const messageData: ChatMessageCreate = {
        content: 'Hello <>&"\'',
      };
      const createdMessage: ChatMessage = {
        id: 'msg-new',
        streamId: mockStreamId,
        userId: 'current-user',
        username: 'testuser',
        displayName: 'Test User',
        avatar: null,
        content: messageData.content,
        messageType: 'chat',
        badges: [],
        isDeleted: false,
        createdAt: '2024-01-01T12:05:00Z',
      };
      (apiClient.post as jest.Mock).mockResolvedValue(createdMessage);

      // When sending the message
      const result = await chatService.sendMessage(mockStreamId, messageData);

      // Then it should send the message correctly
      expect(result.content).toBe('Hello <>&"\'');
    });

    it('should handle sending message with emoji', async () => {
      // Given message with emoji
      const messageData: ChatMessageCreate = {
        content: 'Hello 👋',
      };
      const createdMessage: ChatMessage = {
        id: 'msg-new',
        streamId: mockStreamId,
        userId: 'current-user',
        username: 'testuser',
        displayName: 'Test User',
        avatar: null,
        content: messageData.content,
        messageType: 'chat',
        badges: [],
        isDeleted: false,
        createdAt: '2024-01-01T12:05:00Z',
      };
      (apiClient.post as jest.Mock).mockResolvedValue(createdMessage);

      // When sending the message
      const result = await chatService.sendMessage(mockStreamId, messageData);

      // Then it should send the message correctly
      expect(result.content).toBe('Hello 👋');
    });

    it('should handle authentication errors', async () => {
      // Given authentication error
      const error = new Error('Unauthorized');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      const messageData: ChatMessageCreate = {
        content: 'Test message',
      };

      // When sending a message
      // Then it should throw the error
      await expect(
        chatService.sendMessage(mockStreamId, messageData)
      ).rejects.toThrow('Unauthorized');
    });

    it('should handle server errors', async () => {
      // Given server error
      const error = new Error('Internal server error');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      const messageData: ChatMessageCreate = {
        content: 'Test message',
      };

      // When sending a message
      // Then it should throw the error
      await expect(
        chatService.sendMessage(mockStreamId, messageData)
      ).rejects.toThrow('Internal server error');
    });

    it('should handle rate limiting', async () => {
      // Given rate limit error
      const error = new Error('Too many requests');
      (apiClient.post as jest.Mock).mockRejectedValue(error);
      const messageData: ChatMessageCreate = {
        content: 'Test message',
      };

      // When sending too many messages
      // Then it should throw the error
      await expect(
        chatService.sendMessage(mockStreamId, messageData)
      ).rejects.toThrow('Too many requests');
    });
  });

  describe('deleteMessage', () => {
    it('should delete a chat message', async () => {
      // Given a message ID
      const messageId = 'msg-to-delete';
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      // When deleting the message
      await chatService.deleteMessage(mockStreamId, messageId);

      // Then it should call the API with correct parameters
      expect(apiClient.delete).toHaveBeenCalledWith(
        `/streams/${mockStreamId}/chat/${messageId}`,
        true // authenticated
      );
    });

    it('should require authentication for deleting messages', async () => {
      // Given a message ID
      const messageId = 'msg-123';

      // When deleting a message
      await chatService.deleteMessage(mockStreamId, messageId);

      // Then it should pass authenticated=true
      expect(apiClient.delete).toHaveBeenCalledWith(
        expect.any(String),
        true
      );
    });

    it('should handle message not found', async () => {
      // Given a non-existent message
      const error = new Error('Message not found');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);
      const messageId = 'non-existent';

      // When deleting the message
      // Then it should throw the error
      await expect(
        chatService.deleteMessage(mockStreamId, messageId)
      ).rejects.toThrow('Message not found');
    });

    it('should handle permission errors', async () => {
      // Given permission error
      const error = new Error('Forbidden');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);
      const messageId = 'msg-123';

      // When deleting a message without permission
      // Then it should throw the error
      await expect(
        chatService.deleteMessage(mockStreamId, messageId)
      ).rejects.toThrow('Forbidden');
    });

    it('should handle server errors', async () => {
      // Given server error
      const error = new Error('Internal server error');
      (apiClient.delete as jest.Mock).mockRejectedValue(error);
      const messageId = 'msg-123';

      // When deleting a message
      // Then it should throw the error
      await expect(
        chatService.deleteMessage(mockStreamId, messageId)
      ).rejects.toThrow('Internal server error');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle complete message flow', async () => {
      // Given initial messages
      (apiClient.get as jest.Mock).mockResolvedValue(mockMessages);

      // When fetching messages
      const messages = await chatService.getMessages(mockStreamId);
      expect(messages).toHaveLength(2);

      // And sending a new message
      const newMessageData: ChatMessageCreate = {
        content: 'New message!',
      };
      const newMessage: ChatMessage = {
        id: 'msg-new',
        streamId: mockStreamId,
        userId: 'current-user',
        username: 'testuser',
        displayName: 'Test User',
        avatar: null,
        content: newMessageData.content,
        messageType: 'chat',
        badges: [],
        isDeleted: false,
        createdAt: '2024-01-01T12:05:00Z',
      };
      (apiClient.post as jest.Mock).mockResolvedValue(newMessage);

      const createdMessage = await chatService.sendMessage(
        mockStreamId,
        newMessageData
      );
      expect(createdMessage.content).toBe('New message!');

      // And deleting a message
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);
      await chatService.deleteMessage(mockStreamId, 'msg-1');

      // Then all operations should succeed
      expect(apiClient.get).toHaveBeenCalled();
      expect(apiClient.post).toHaveBeenCalled();
      expect(apiClient.delete).toHaveBeenCalled();
    });

    it('should handle pagination through history', async () => {
      // Given multiple pages of history
      const firstPage = [mockMessages[0]];
      const secondPage = [mockMessages[1]];

      (apiClient.get as jest.Mock)
        .mockResolvedValueOnce(firstPage)
        .mockResolvedValueOnce(secondPage);

      // When fetching first page
      const page1 = await chatService.getHistory(mockStreamId, undefined, 1);
      expect(page1).toHaveLength(1);

      // And fetching second page
      const page2 = await chatService.getHistory(
        mockStreamId,
        page1[0].createdAt,
        1
      );
      expect(page2).toHaveLength(1);

      // Then both pages should be retrieved correctly
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });
});
