
import { useEffect, useRef, useState, useLayoutEffect, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import { useChatOperations } from '@/hooks/useChatOperations';
import { InteractionFormData } from '@/types/crm';
import { ChatHeader } from './ChatHeader';
import { ChatLoading } from './ChatLoading';
import { MessageList } from './MessageList';
import { ChatFooter } from './ChatFooter';

interface ChatViewProps {
  companyId?: string;
  contactId?: string;
  companyName?: string;
  contactName?: string;
  isReadOnly?: boolean;
  onBack?: () => void;
}

export const ChatView = ({ companyId, contactId, companyName, contactName, isReadOnly = false, onBack }: ChatViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const scrollHeightBeforeLoad = useRef(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const observer = useRef<IntersectionObserver>();

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useCrmInteractions(companyId, contactId);

  const { sendMessage, handleQuickAction, isTyping, isSending } = useChatOperations(companyId, contactId);

  // Reset initial load state when chat context changes
  useEffect(() => {
    setIsInitialLoad(true);
    if(chatContainerRef.current) chatContainerRef.current.scrollTop = 0;
  }, [companyId, contactId]);

  // Observer to trigger fetching older messages
  const loadMoreTriggerRef = useCallback((node: HTMLDivElement | null) => {
    if (isLoading || isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        if (chatContainerRef.current) {
          scrollHeightBeforeLoad.current = chatContainerRef.current.scrollHeight;
        }
        fetchNextPage();
      }
    });

    if (node) observer.current.observe(node);
  }, [hasNextPage, fetchNextPage, isLoading, isFetchingNextPage]);

  // Effect for scroll management after render
  useLayoutEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    if (scrollHeightBeforeLoad.current > 0) {
      // Case 1: We just loaded older messages (scrolled up)
      container.scrollTop = container.scrollHeight - scrollHeightBeforeLoad.current;
      scrollHeightBeforeLoad.current = 0; // Reset
    } else if (isInitialLoad && displayMessages.length > 0) {
      // Case 2: Initial load of the chat
      container.scrollTop = container.scrollHeight;
      setIsInitialLoad(false);
    }
  }, [isInitialLoad, companyId, contactId, data]);

  // Effect for new messages at the bottom (typing, sent, or received)
  useEffect(() => {
    // Only scroll to bottom if we are not loading previous messages from the top
    if (scrollHeightBeforeLoad.current === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isTyping, isSending, data]);


  const handleSendMessage = (data: Partial<InteractionFormData>) => {
    sendMessage(data);
  };

  const displayMessages = useMemo(() => {
    if (!data?.pages) return [];
    const interactions = data.pages.flat().reverse();

    return interactions.flatMap((interaction: any) => {
      if (interaction.type === 'mercadolibre_question') {
        const question = {
          ...interaction,
          id: `${interaction.id}-question`,
          isOutgoing: false,
          description: null, // The answer is in the description, so we hide it here
        };
  
        // If there is a description, it means we have an answer. Create a separate message for it.
        if (interaction.description) {
          const answer = {
            ...interaction,
            id: `${interaction.id}-answer`,
            isOutgoing: true,
            type: 'mercadolibre_answer', // Artificial type for our reply
            subject: interaction.description, // The answer text becomes the main subject
            description: null,
            metadata: { // Only keep relevant metadata for the answer
              response_time_seconds: interaction.metadata?.response_time_seconds,
            }
          };
          return [question, answer];
        }
        
        return [question];
      }
      
      // All other interaction types are considered outgoing (from us)
      return [{ ...interaction, isOutgoing: true }];
    });
  }, [data]);

  if (isLoading && isInitialLoad) {
    return <ChatLoading />;
  }

  return (
    <Card className="h-full flex flex-col">
      <ChatHeader 
        onBack={onBack}
        contactName={contactName}
        companyName={companyName}
      />

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <MessageList
          chatContainerRef={chatContainerRef}
          loadMoreTriggerRef={loadMoreTriggerRef}
          isFetchingNextPage={isFetchingNextPage}
          displayMessages={displayMessages}
          isLoading={isLoading}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
        />
        
        <ChatFooter 
          isReadOnly={isReadOnly}
          isSending={isSending}
          companyName={companyName}
          handleQuickAction={handleQuickAction}
          handleSendMessage={handleSendMessage}
        />
      </CardContent>
    </Card>
  );
};
