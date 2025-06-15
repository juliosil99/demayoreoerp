
import React from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageListProps {
  chatContainerRef: React.RefObject<HTMLDivElement>;
  loadMoreTriggerRef: (node: HTMLDivElement | null) => void;
  isFetchingNextPage: boolean;
  displayMessages: any[];
  isLoading: boolean;
  isTyping: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList = ({
  chatContainerRef,
  loadMoreTriggerRef,
  isFetchingNextPage,
  displayMessages,
  isLoading,
  isTyping,
  messagesEndRef
}: MessageListProps) => {
  return (
    <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto">
      <div ref={loadMoreTriggerRef}>
        {isFetchingNextPage && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
            <span className="ml-2 text-muted-foreground">Cargando mensajes...</span>
          </div>
        )}
      </div>
      
      {displayMessages.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            No hay conversaciones
          </h3>
          <p className="text-sm text-muted-foreground">
            Inicia una conversación enviando un mensaje o usando las acciones rápidas
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {displayMessages.map((msg: any) => (
            <MessageBubble
              key={msg.id}
              interaction={msg}
              isOutgoing={msg.isOutgoing}
            />
          ))}
          
          {isTyping && <TypingIndicator />}
          
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};
