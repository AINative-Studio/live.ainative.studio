import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatPanel } from '../chat-panel';
import type { ChatMessage } from '@/types';

describe('ChatPanel Component', () => {
  const mockMessages: ChatMessage[] = [
    {
      id: 'msg-1',
      streamId: 'stream-1',
      userId: 'user-1',
      username: 'user1',
      displayName: 'User One',
      avatar: null,
      content: 'First message',
      messageType: 'chat',
      badges: [],
      isDeleted: false,
      createdAt: '2024-01-01T12:00:00Z',
    },
    {
      id: 'msg-2',
      streamId: 'stream-1',
      userId: 'user-2',
      username: 'user2',
      displayName: 'User Two',
      avatar: null,
      content: 'Second message',
      messageType: 'chat',
      badges: [],
      isDeleted: false,
      createdAt: '2024-01-01T12:01:00Z',
    },
  ];

  const mockCurrentUser = {
    id: 'current-user',
    username: 'currentuser',
    displayName: 'Current User',
    avatar: null,
  };

  const defaultProps = {
    messages: mockMessages,
    onSendMessage: jest.fn(),
    isConnected: true,
    isAuthenticated: true,
    currentUser: mockCurrentUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the chat panel with header', () => {
      // Given valid props
      // When rendering the component
      render(<ChatPanel {...defaultProps} />);

      // Then it should display the header
      expect(screen.getByText('Live Chat')).toBeInTheDocument();
    });

    it('should display message count in header', () => {
      // Given messages
      // When rendering the component
      render(<ChatPanel {...defaultProps} />);

      // Then it should show the count
      expect(screen.getByText('(2 messages)')).toBeInTheDocument();
    });

    it('should display connection status as connected', () => {
      // Given connected state
      // When rendering the component
      render(<ChatPanel {...defaultProps} />);

      // Then it should show connected status
      expect(screen.getByText('Connected')).toBeInTheDocument();
    });

    it('should display connection status as disconnected', () => {
      // Given disconnected state
      // When rendering the component
      render(<ChatPanel {...defaultProps} isConnected={false} />);

      // Then it should show disconnected status
      expect(screen.getByText('Disconnected')).toBeInTheDocument();
    });

    it('should render all messages', () => {
      // Given multiple messages
      // When rendering the component
      render(<ChatPanel {...defaultProps} />);

      // Then all messages should be displayed
      expect(screen.getByText('First message')).toBeInTheDocument();
      expect(screen.getByText('Second message')).toBeInTheDocument();
    });

    it('should render with no messages', () => {
      // Given no messages
      // When rendering the component
      render(<ChatPanel {...defaultProps} messages={[]} />);

      // Then it should show zero messages
      expect(screen.getByText('(0 messages)')).toBeInTheDocument();
    });
  });

  describe('Message Input', () => {
    it('should render message input when authenticated', () => {
      // Given authenticated user
      // When rendering the component
      render(<ChatPanel {...defaultProps} />);

      // Then input should be visible
      const input = screen.getByPlaceholderText('Send a message...');
      expect(input).toBeInTheDocument();
    });

    it('should allow typing in message input', async () => {
      // Given authenticated user
      const user = userEvent.setup();
      render(<ChatPanel {...defaultProps} />);

      // When typing in the input
      const input = screen.getByPlaceholderText('Send a message...');
      await user.type(input, 'Hello world!');

      // Then the input should contain the text
      expect(input).toHaveValue('Hello world!');
    });

    it('should have max length of 500 characters', () => {
      // Given authenticated user
      // When rendering the component
      render(<ChatPanel {...defaultProps} />);

      // Then input should have maxLength attribute
      const input = screen.getByPlaceholderText('Send a message...');
      expect(input).toHaveAttribute('maxLength', '500');
    });

    it('should show "Log in to chat" when not authenticated', () => {
      // Given unauthenticated user
      // When rendering the component
      render(<ChatPanel {...defaultProps} isAuthenticated={false} currentUser={null} />);

      // Then login prompt should be shown
      expect(screen.getByText('Log in to chat')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Send a message...')).not.toBeInTheDocument();
    });

    it('should disable input when disconnected', () => {
      // Given disconnected state
      // When rendering the component
      render(<ChatPanel {...defaultProps} isConnected={false} />);

      // Then input should be disabled
      const input = screen.getByPlaceholderText('Connecting to chat...');
      expect(input).toBeDisabled();
    });

    it('should disable input when not authenticated', () => {
      // Given unauthenticated state
      // When rendering the component with no auth
      render(
        <ChatPanel
          {...defaultProps}
          isAuthenticated={false}
          currentUser={null}
        />
      );

      // Then no input should be rendered (login prompt instead)
      expect(screen.queryByPlaceholderText('Send a message...')).not.toBeInTheDocument();
    });

    it('should update placeholder when disconnected', () => {
      // Given disconnected state
      // When rendering the component
      render(<ChatPanel {...defaultProps} isConnected={false} />);

      // Then placeholder should indicate connecting
      expect(screen.getByPlaceholderText('Connecting to chat...')).toBeInTheDocument();
    });
  });

  describe('Sending Messages', () => {
    it('should call onSendMessage when form is submitted', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When typing and submitting a message
      const input = screen.getByPlaceholderText('Send a message...');
      await user.type(input, 'Test message');
      await user.click(screen.getByRole('button', { name: '' })); // Send button

      // Then onSendMessage should be called with the message
      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should clear input after sending message', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      render(<ChatPanel {...defaultProps} />);

      // When typing and submitting a message
      const input = screen.getByPlaceholderText('Send a message...');
      await user.type(input, 'Test message');
      await user.click(screen.getByRole('button', { name: '' })); // Send button

      // Then input should be cleared
      await waitFor(() => {
        expect(input).toHaveValue('');
      });
    });

    it('should trim whitespace from messages', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When typing message with whitespace
      const input = screen.getByPlaceholderText('Send a message...');
      await user.type(input, '  Test message  ');
      await user.click(screen.getByRole('button', { name: '' })); // Send button

      // Then onSendMessage should be called with trimmed message
      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should not send empty messages', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When trying to send empty message
      const sendButton = screen.getByRole('button', { name: '' });
      await user.click(sendButton);

      // Then onSendMessage should not be called
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('should not send whitespace-only messages', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When typing only whitespace
      const input = screen.getByPlaceholderText('Send a message...');
      await user.type(input, '    ');
      await user.click(screen.getByRole('button', { name: '' })); // Send button

      // Then onSendMessage should not be called
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('should not send messages when disconnected', async () => {
      // Given disconnected state
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(
        <ChatPanel
          {...defaultProps}
          onSendMessage={onSendMessage}
          isConnected={false}
        />
      );

      // When trying to send a message
      const input = screen.getByPlaceholderText('Connecting to chat...');
      await user.type(input, 'Test message');

      // The send button should be disabled, but let's try form submission
      const form = input.closest('form');
      if (form) {
        fireEvent.submit(form);
      }

      // Then onSendMessage should not be called
      expect(onSendMessage).not.toHaveBeenCalled();
    });

    it('should disable send button when input is empty', () => {
      // Given authenticated and connected user
      // When rendering with empty input
      render(<ChatPanel {...defaultProps} />);

      // Then send button should be disabled
      const sendButton = screen.getByRole('button', { name: '' });
      expect(sendButton).toBeDisabled();
    });

    it('should submit on Enter key', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When typing and pressing Enter
      const input = screen.getByPlaceholderText('Send a message...');
      await user.type(input, 'Test message{Enter}');

      // Then onSendMessage should be called
      expect(onSendMessage).toHaveBeenCalledWith('Test message');
    });

    it('should handle special characters in messages', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When typing message with special characters
      const input = screen.getByPlaceholderText('Send a message...');
      const specialMessage = 'Hello <>&"\'';
      await user.type(input, specialMessage);
      await user.click(screen.getByRole('button', { name: '' })); // Send button

      // Then onSendMessage should be called with the special characters
      expect(onSendMessage).toHaveBeenCalledWith(specialMessage);
    });

    it('should handle emoji in messages', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When typing message with emoji
      const input = screen.getByPlaceholderText('Send a message...');
      await user.type(input, 'Hello 👋');
      await user.click(screen.getByRole('button', { name: '' })); // Send button

      // Then onSendMessage should be called with the emoji
      expect(onSendMessage).toHaveBeenCalledWith('Hello 👋');
    });
  });

  describe('Auto-scroll Behavior', () => {
    it('should auto-scroll to bottom when new messages arrive', async () => {
      // Given initial messages
      const { rerender } = render(<ChatPanel {...defaultProps} />);

      // Mock scrollIntoView
      const scrollIntoViewMock = jest.fn();
      Element.prototype.scrollIntoView = scrollIntoViewMock;

      // When new messages are added
      const newMessages = [
        ...mockMessages,
        {
          id: 'msg-3',
          streamId: 'stream-1',
          userId: 'user-3',
          username: 'user3',
          displayName: 'User Three',
          avatar: null,
          content: 'Third message',
          messageType: 'chat' as const,
          badges: [],
          isDeleted: false,
          createdAt: '2024-01-01T12:02:00Z',
        },
      ];
      rerender(<ChatPanel {...defaultProps} messages={newMessages} />);

      // Then it should scroll to bottom
      await waitFor(() => {
        expect(scrollIntoViewMock).toHaveBeenCalled();
      });
    });
  });

  describe('Load More Messages', () => {
    it('should render "Load more messages" button when onLoadMore is provided', () => {
      // Given onLoadMore callback
      const onLoadMore = jest.fn();
      // When rendering the component
      render(<ChatPanel {...defaultProps} onLoadMore={onLoadMore} />);

      // Then load more button should be visible
      expect(screen.getByText('Load more messages')).toBeInTheDocument();
    });

    it('should not render "Load more messages" button when onLoadMore is not provided', () => {
      // Given no onLoadMore callback
      // When rendering the component
      render(<ChatPanel {...defaultProps} />);

      // Then load more button should not be visible
      expect(screen.queryByText('Load more messages')).not.toBeInTheDocument();
    });

    it('should call onLoadMore when button is clicked', async () => {
      // Given onLoadMore callback
      const user = userEvent.setup();
      const onLoadMore = jest.fn();
      render(<ChatPanel {...defaultProps} onLoadMore={onLoadMore} />);

      // When clicking load more button
      await user.click(screen.getByText('Load more messages'));

      // Then onLoadMore should be called
      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when isLoadingMore is true', () => {
      // Given loading state
      const onLoadMore = jest.fn();
      // When rendering the component
      render(
        <ChatPanel
          {...defaultProps}
          onLoadMore={onLoadMore}
          isLoadingMore={true}
        />
      );

      // Then loading text should be shown
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should disable load more button when loading', () => {
      // Given loading state
      const onLoadMore = jest.fn();
      // When rendering the component
      render(
        <ChatPanel
          {...defaultProps}
          onLoadMore={onLoadMore}
          isLoadingMore={true}
        />
      );

      // Then button should be disabled
      const loadMoreButton = screen.getByText('Loading...');
      expect(loadMoreButton).toBeDisabled();
    });
  });

  describe('Connection Indicator', () => {
    it('should show green indicator when connected', () => {
      // Given connected state
      // When rendering the component
      const { container } = render(<ChatPanel {...defaultProps} />);

      // Then green indicator should be shown
      const indicator = container.querySelector('.bg-green-500');
      expect(indicator).toBeInTheDocument();
    });

    it('should show red indicator when disconnected', () => {
      // Given disconnected state
      // When rendering the component
      const { container } = render(<ChatPanel {...defaultProps} isConnected={false} />);

      // Then red indicator should be shown
      const indicator = container.querySelector('.bg-red-500');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid message sending', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When sending multiple messages quickly
      const input = screen.getByPlaceholderText('Send a message...');
      const sendButton = screen.getByRole('button', { name: '' });

      await user.type(input, 'Message 1');
      await user.click(sendButton);

      await user.type(input, 'Message 2');
      await user.click(sendButton);

      await user.type(input, 'Message 3');
      await user.click(sendButton);

      // Then all messages should be sent
      expect(onSendMessage).toHaveBeenCalledTimes(3);
      expect(onSendMessage).toHaveBeenNthCalledWith(1, 'Message 1');
      expect(onSendMessage).toHaveBeenNthCalledWith(2, 'Message 2');
      expect(onSendMessage).toHaveBeenNthCalledWith(3, 'Message 3');
    });

    it('should handle very long message list', () => {
      // Given many messages
      const manyMessages = Array.from({ length: 100 }, (_, i) => ({
        id: `msg-${i}`,
        streamId: 'stream-1',
        userId: `user-${i}`,
        username: `user${i}`,
        displayName: `User ${i}`,
        avatar: null,
        content: `Message ${i}`,
        messageType: 'chat' as const,
        badges: [],
        isDeleted: false,
        createdAt: new Date(Date.now() + i * 1000).toISOString(),
      }));

      // When rendering the component
      render(<ChatPanel {...defaultProps} messages={manyMessages} />);

      // Then it should display the count
      expect(screen.getByText('(100 messages)')).toBeInTheDocument();
    });

    it('should handle maximum length message', async () => {
      // Given authenticated and connected user
      const user = userEvent.setup();
      const onSendMessage = jest.fn();
      render(<ChatPanel {...defaultProps} onSendMessage={onSendMessage} />);

      // When typing maximum length message
      const maxMessage = 'a'.repeat(500);
      const input = screen.getByPlaceholderText('Send a message...');
      await user.type(input, maxMessage);
      await user.click(screen.getByRole('button', { name: '' })); // Send button

      // Then it should send the full message
      expect(onSendMessage).toHaveBeenCalledWith(maxMessage);
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      // Given authenticated user
      // When rendering the component
      const { container } = render(<ChatPanel {...defaultProps} />);

      // Then form should exist
      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      // Given authenticated user
      // When rendering the component
      render(<ChatPanel {...defaultProps} />);

      // Then buttons should be accessible (even if visually hidden)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
