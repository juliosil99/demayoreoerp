
import React, { useMemo, useState } from "react";
import { useCrmConversations } from "@/hooks/useCrmConversations";
import { MessageBubble } from "@/components/crm/chat/MessageBubble";
import { ChatInput } from "@/components/crm/chat/ChatInput";
import { ConversationsList } from "@/components/crm/chat/ConversationsList";
import { useCrmInteractions } from "@/hooks/useCrmInteractions";
import { Button } from "@/components/ui/button";

const CrmChatPage: React.FC = () => {
  const { data: conversations = [], isLoading } = useCrmConversations();
  const [activeConversationKey, setActiveConversationKey] = useState<
    string | null
  >(null);

  // Conversación seleccionada
  const activeConversation = useMemo(
    () => conversations.find((c) => c.conversationKey === activeConversationKey),
    [conversations, activeConversationKey]
  );

  // Filtros (sin responder, abierta/cerrada)
  const [filters, setFilters] = useState({
    onlyUnanswered: false,
    statusFilter: "open",
    search: "",
  });

  // Obtener interacciones de la conversación activa
  // NOTA: Si es necesario, podríamos consultar individualmente por performance
  const interactions = activeConversation?.allInteractions || [];

  // Estado para saber si está cerrada la conversación
  const isClosed = activeConversation?.status === "closed";

  // Acción ejemplo: cerrar conversación (update en Supabase)
  const handleClose = async () => {
    if (!activeConversation) return;
    // Supabase update
    await fetch("/api/crm/conversation/close", {
      method: "POST",
      body: JSON.stringify({ conversationKey: activeConversation.conversationKey }),
    });
    // TODO: Revalidar query/actualizar datos
  };

  return (
    <div className="flex h-[90vh] min-h-[500px] bg-white rounded-lg border overflow-hidden shadow">
      {/* Sidebar de conversaciones */}
      <div className="w-[310px] border-r bg-gray-50 h-full flex-shrink-0">
        <ConversationsList
          conversations={conversations}
          activeKey={activeConversationKey}
          onSelect={setActiveConversationKey}
          filters={filters}
          setFilters={setFilters}
        />
      </div>
      {/* Chat principal */}
      <div className="flex-1 flex flex-col h-full">
        {/* Header conversación */}
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <div className="font-bold text-lg">
              {activeConversation?.companyName ||
                activeConversation?.contactName ||
                "Selecciona una conversación"}
            </div>
            <div className="text-sm text-muted-foreground">
              {activeConversation?.channel}
            </div>
          </div>
          {activeConversation && !isClosed && (
            <Button
              variant="outline"
              onClick={handleClose}
              size="sm"
              className="ml-2"
            >
              Cerrar conversación
            </Button>
          )}
          {isClosed && (
            <span className="text-red-500 font-semibold">CERRADA</span>
          )}
        </div>
        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-6 py-4 bg-white">
          {interactions.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              No hay mensajes en esta conversación
            </div>
          ) : (
            interactions
              .slice()
              .reverse()
              .map((i) => (
                <MessageBubble
                  key={i.id}
                  interaction={i}
                  isOutgoing={!(i.type === "mercadolibre_question")}
                />
              ))
          )}
        </div>
        {/* Input solo si abierto */}
        <div className="p-4 border-t bg-gray-50">
          {activeConversation && !isClosed ? (
            <ChatInput
              companyId={interactions[0]?.company_id}
              contactId={interactions[0]?.contact_id}
              channel={interactions[0]?.type}
              disabled={isClosed}
            />
          ) : (
            <div className="text-xs text-muted-foreground">
              {isClosed
                ? "Esta conversación está cerrada. No puedes enviar mensajes."
                : "Selecciona una conversación para empezar a chatear."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrmChatPage;
