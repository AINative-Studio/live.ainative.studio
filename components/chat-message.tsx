import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="flex gap-2 px-3 py-2 hover:bg-muted/30 transition-colors">
      <Avatar className="w-8 h-8">
        <AvatarImage src={message.avatar} alt={message.username} />
        <AvatarFallback>{message.username[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold text-sm">{message.username}</span>
          {message.badges?.map((badge) => (
            <Badge key={badge} variant="secondary" className="text-[10px] px-1 py-0">
              {badge}
            </Badge>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
        <p className="text-sm break-words">{message.message}</p>
      </div>
    </div>
  );
}
