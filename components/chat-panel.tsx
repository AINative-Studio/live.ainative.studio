'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Smile, Sparkles } from 'lucide-react';
import { ChatMessage } from './chat-message';
import { aiChatService } from '@/services/ai-chat';
import { NotFoundError } from '@/lib/api-client';
import type { ChatMessage as ChatMessageType } from '@/types';

// Minimal user type for auth context compatibility
interface AuthUser {
  id: string;
  username: string | null;
  displayName: string | null;
  avatar: string | null;
}

interface ChatPanelProps {
  messages: ChatMessageType[];
  onSendMessage: (content: string) => void;
  isConnected: boolean;
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  streamId?: string;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isConnected,
  isAuthenticated,
  currentUser,
  streamId,
  onLoadMore,
  isLoadingMore = false,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isAiMode, setIsAiMode] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<ChatMessageType[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Merge regular messages with local AI messages
  const allMessages = [...messages, ...aiMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [allMessages.length]);

  const createAiMessage = useCallback((content: string): ChatMessageType => {
    return {
      id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      streamId: streamId || '',
      userId: null,
      username: 'ainative-ai',
      displayName: 'AINative AI',
      avatar: null,
      content,
      messageType: 'ai',
      badges: [],
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };
  }, [streamId]);

  const handleAiQuestion = useCallback(async (question: string) => {
    if (!streamId) return;

    setIsAiLoading(true);

    try {
      const response = await aiChatService.askQuestion(streamId, question);
      const aiMsg = createAiMessage(response.answer);
      setAiMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const isNotFound = err instanceof NotFoundError;
      const fallbackText = isNotFound
        ? 'AI assistant coming soon! This feature is not available yet.'
        : 'Sorry, I could not process your question right now. Please try again later.';
      const aiMsg = createAiMessage(fallbackText);
      setAiMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsAiLoading(false);
      setIsAiMode(false);
    }
  }, [streamId, createAiMessage]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated || !isConnected) return;

    const trimmed = newMessage.trim();

    // Check for @ai prefix — intercept before sending to chat WebSocket
    if (trimmed.toLowerCase().startsWith('@ai ')) {
      const question = trimmed.slice(4).trim();
      if (question) {
        setNewMessage('');
        handleAiQuestion(question);
        return;
      }
    }

    // If AI mode is active, send as AI question
    if (isAiMode && streamId) {
      setNewMessage('');
      handleAiQuestion(trimmed);
      return;
    }

    onSendMessage(trimmed);
    setNewMessage('');
  };

  const toggleAiMode = () => {
    setIsAiMode((prev) => !prev);
  };

  const isInputDisabled = !isConnected || !isAuthenticated;

  return (
    <Card className="flex flex-col h-full border-border bg-card">
      <CardHeader className="border-b border-border/50 bg-card">
        <CardTitle className="text-lg flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            Live Chat
            <span className="text-xs font-normal text-muted-foreground">
              ({allMessages.length} messages)
            </span>
          </span>
          <span className={`flex items-center gap-1.5 text-sm font-normal ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden bg-card">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="py-2">
            {onLoadMore && (
              <div className="text-center py-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isLoadingMore}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {isLoadingMore ? 'Loading...' : 'Load more messages'}
                </Button>
              </div>
            )}
            {allMessages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isAiLoading && (
              <div className="flex gap-2 px-3 py-2 bg-brand-primary/10 border-l-2 border-brand-primary/40 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-brand-primary animate-spin" />
                </div>
                <div className="flex-1 flex items-center">
                  <span className="text-sm text-brand-primary">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* AI mode indicator */}
        {isAiMode && (
          <div className="px-3 py-1.5 bg-brand-primary/10 border-t border-brand-primary/20 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-brand-primary" />
            <span className="text-xs text-brand-primary font-medium">
              Asking AI — type your question
            </span>
            <button
              onClick={() => setIsAiMode(false)}
              className="ml-auto text-xs text-brand-primary/60 hover:text-brand-primary"
            >
              Cancel
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="p-3 border-t border-border/50 bg-card">
          {isAuthenticated ? (
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  isAiMode
                    ? 'Ask the AI a question...'
                    : isConnected
                      ? 'Send a message... (type @ai to ask AI)'
                      : 'Connecting to chat...'
                }
                disabled={isInputDisabled || isAiLoading}
                className={`flex-1 bg-background border-border focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAiMode ? 'border-brand-primary/40 ring-1 ring-brand-primary/20' : ''
                }`}
                maxLength={500}
              />
              <Button
                size="icon"
                variant="ghost"
                type="button"
                disabled={isInputDisabled || isAiLoading}
                onClick={toggleAiMode}
                className={`hover:bg-brand-primary/10 hover:text-brand-primary disabled:opacity-50 ${
                  isAiMode ? 'bg-brand-primary/10 text-brand-primary' : ''
                }`}
                title="Ask AI"
              >
                <Sparkles className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                type="button"
                disabled={isInputDisabled}
                className="hover:bg-accent/10 hover:text-accent disabled:opacity-50"
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                size="icon"
                type="submit"
                disabled={isInputDisabled || !newMessage.trim() || isAiLoading}
                className="bg-brand-primary hover:bg-primary-dark text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center py-2">
              <a href="/login" className="text-brand-primary hover:underline font-medium">
                Log in to chat
              </a>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
