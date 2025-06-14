import { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Building2, User } from 'lucide-react';
import { useCrmInteractions } from '@/hooks/useCrmInteractions';
import { useChatOperations } from '@/hooks/useChatOperations';
import { MessageBubble } from './MessageBubble';
import { QuickActions } from './QuickActions';
import { ChatInput } from './ChatInput';
import { InteractionFormData } from '@/types/crm';

interface ChatViewProps {
  companyId?: string;
  contactId?: string;
  companyName?: string;
  contactName?: string;
  isReadOnly?: boolean;
}

export const ChatView = ({ companyId, contactId, companyName, contactName, isReadOnly = false }: ChatViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  
  const { data: interactions = [], isLoading } = useCrmInteractions(companyId, contactId);
  const { sendMessage, handleQuickAction, isTyping, isSending } = useChatOperations(companyId, contactId);

  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Usamos useLayoutEffect para asegurar que el scroll ocurra después del renderizado del layout
  useLayoutEffect(() => {
    // Cuando se cargan mensajes (nuevos o al cambiar de chat), nos desplazamos
    if (interactions.length > lastMessageCount) {
      // Si es la carga inicial (lastMessageCount es 0), saltamos al final sin animación.
      // Para mensajes nuevos, el scroll es suave.
      const behavior = lastMessageCount === 0 ? 'auto' : 'smooth';
      scrollToBottom(behavior);
    }
    // Actualizamos el contador después del check
    if (interactions.length !== lastMessageCount) {
      setLastMessageCount(interactions.length);
    }
  }, [interactions, lastMessageCount]);

  // Scroll cuando aparece el indicador de typing
  useEffect(() => {
    if (isTyping) {
      scrollToBottom();
    }
  }, [isTyping]);

  const handleSendMessage = (data: Partial<InteractionFormData>) => {
    sendMessage(data);
  };

  const displayMessages = interactions.flatMap((interaction: any) => {
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

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Cargando conversación...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b bg-gray-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Chat
          </CardTitle>
          <div className="flex items-center gap-2">
            {companyName && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {companyName}
              </Badge>
            )}
            {contactName && (
              <Badge variant="outline" className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {contactName}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages Area - Ahora usa flex-1 para ocupar todo el espacio disponible */}
        <div className="flex-1 p-4 overflow-y-auto">
          {displayMessages.length === 0 ? (
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
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Controles fijos en la parte inferior */}
        {!isReadOnly ? (
          <div className="flex-shrink-0 border-t bg-white">
            {/* Quick Actions */}
            <div className="px-4 pt-3">
              <QuickActions onQuickAction={handleQuickAction} />
            </div>

            {/* Chat Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              disabled={isSending}
              placeholder={`Escribe un mensaje${companyName ? ` para ${companyName}` : ''}...`}
            />
          </div>
        ) : (
          <div className="flex-shrink-0 p-4 border-t text-center text-sm text-muted-foreground bg-gray-50">
            Esta conversación es de solo lectura.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
