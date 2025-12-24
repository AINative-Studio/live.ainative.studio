'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Smile } from 'lucide-react';
import { ChatMessage } from './chat-message';
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
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export function ChatPanel({
  messages,
  onSendMessage,
  isConnected,
  isAuthenticated,
  currentUser,
  onLoadMore,
  isLoadingMore = false,
}: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isAuthenticated || !isConnected) return;

    onSendMessage(newMessage.trim());
    setNewMessage('');
  };

  const isInputDisabled = !isConnected || !isAuthenticated;

  return (
    <Card className="flex flex-col h-full border-border bg-card">
      <CardHeader className="border-b border-border/50 bg-card">
        <CardTitle className="text-lg flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            Live Chat
            <span className="text-xs font-normal text-muted-foreground">
              ({messages.length} messages)
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
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        <form onSubmit={handleSend} className="p-3 border-t border-border/50 bg-card">
          {isAuthenticated ? (
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={isConnected ? "Send a message..." : "Connecting to chat..."}
                disabled={isInputDisabled}
                className="flex-1 bg-background border-border focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={500}
              />
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
                disabled={isInputDisabled || !newMessage.trim()}
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
