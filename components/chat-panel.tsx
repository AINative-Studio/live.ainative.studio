'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Smile } from 'lucide-react';
import { ChatMessage } from './chat-message';
import type { ChatMessage as ChatMessageType } from '@/types';

const mockMessages: ChatMessageType[] = [
  {
    id: '1',
    username: 'devmaster',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    message: 'This is amazing! What IDE are you using?',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    badges: ['Subscriber'],
  },
  {
    id: '2',
    username: 'codewizard',
    avatar: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    message: 'Cursor with Claude API integration',
    timestamp: new Date(Date.now() - 240000).toISOString(),
  },
  {
    id: '3',
    username: 'aibuilder',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
    message: 'Can you show the RAG setup?',
    timestamp: new Date(Date.now() - 180000).toISOString(),
    badges: ['Moderator'],
  },
  {
    id: '4',
    username: 'pythonista',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=100',
    message: 'The code completion is so smooth!',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: '5',
    username: 'frontend_dev',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    message: 'What model are you using for this?',
    timestamp: new Date(Date.now() - 60000).toISOString(),
  },
];

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessageType[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message: ChatMessageType = {
        id: Date.now().toString(),
        username: 'You',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100',
        message: newMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <Card className="flex flex-col h-full border-border">
      <CardHeader className="border-b border-border">
        <CardTitle className="font-mono text-lg flex items-center gap-2">
          Live Chat
          <span className="text-xs font-normal text-muted-foreground">
            ({messages.length} messages)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="py-2">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSend} className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Send a message..."
              className="flex-1"
            />
            <Button size="icon" variant="ghost">
              <Smile className="w-5 h-5" />
            </Button>
            <Button size="icon" type="submit">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
