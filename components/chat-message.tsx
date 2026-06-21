import { memo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Sparkles, ShieldAlert } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';
import type { ModerationAction } from '@/services/moderation';

interface ChatMessageProps {
  message: ChatMessageType;
  moderation?: {
    action: ModerationAction;
    reason: string;
  };
}

export const ChatMessage = memo(function ChatMessage({ message, moderation }: ChatMessageProps) {
  const displayName = message.displayName || message.username;
  const isSystemMessage = message.messageType === 'system';
  const isAiMessage = message.messageType === 'ai';
  const isBlocked = moderation?.action === 'block';
  const isWarning = moderation?.action === 'warning';

  if (isAiMessage) {
    return (
      <div className="flex gap-2 px-3 py-2 bg-brand-primary/10 border-l-2 border-brand-primary/40">
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-brand-primary/20 text-brand-primary font-medium">
            <Sparkles className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-semibold text-sm text-brand-primary">
              AINative AI
            </span>
            <Badge className="text-[10px] px-1.5 py-0 bg-brand-primary/20 text-brand-primary border-brand-primary/30 font-medium gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              AI
            </Badge>
            <span className="text-xs text-neutral-muted ml-auto" suppressHydrationWarning>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div className="text-sm break-words text-foreground whitespace-pre-wrap font-mono leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    );
  }

  const moderationBg = isBlocked
    ? 'bg-red-500/5 border-l-2 border-red-500/40'
    : isWarning
      ? 'bg-yellow-500/5 border-l-2 border-yellow-500/40'
      : '';

  return (
    <div className={`flex gap-2 px-3 py-2 hover:bg-dark-3/40 transition-colors ${isSystemMessage ? 'bg-dark-3/20' : ''} ${moderationBg}`}>
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
          {(isWarning || isBlocked) && (
            <ShieldAlert
              className={`h-3.5 w-3.5 ${isBlocked ? 'text-red-400' : 'text-yellow-400'}`}
              aria-label={isBlocked ? 'Blocked by AI moderator' : 'Flagged by AI moderator'}
            />
          )}
          <span className="text-xs text-neutral-muted ml-auto" suppressHydrationWarning>
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        {isBlocked ? (
          <p className="text-sm text-red-400/70 italic">
            [Message removed by AI moderator]
          </p>
        ) : (
          <p className={`text-sm break-words ${isSystemMessage ? 'text-gray-400 italic' : 'text-foreground'}`}>
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
});
