import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage = memo(function ChatMessage({ message }: ChatMessageProps) {
  const displayName = message.displayName || message.username;
  const isSystemMessage = message.messageType === 'system';

  return (
    <div className={`flex gap-2 px-3 py-2 hover:bg-dark-3/40 transition-colors ${isSystemMessage ? 'bg-dark-3/20' : ''}`}>
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.avatar || undefined} alt={displayName} />
        <AvatarFallback className="bg-dark-3 text-brand-primary font-medium">
          {displayName?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`font-semibold text-sm ${isSystemMessage ? 'text-yellow-500' : 'text-brand-primary'}`}>
            {displayName}
          </span>
          {message.badges?.map((badge, index) => (
            <Badge
              key={`${badge.type}-${index}`}
              className="text-[10px] px-1.5 py-0 bg-brand-primary/20 text-brand-primary border-brand-primary/30 font-medium"
            >
              {badge.label}
            </Badge>
          ))}
          <span className="text-xs text-neutral-muted ml-auto" suppressHydrationWarning>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <p className={`text-sm break-words ${isSystemMessage ? 'text-gray-400 italic' : 'text-foreground'}`}>
          {message.content}
        </p>
      </div>
    </div>
  );
});
