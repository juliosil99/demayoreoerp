
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Circle } from "lucide-react";
import { ConversationsList } from "@/components/crm/chat/ConversationsList";
import { ChatView } from "@/components/crm/chat/ChatView";
import { useCrmConversations } from "@/hooks/useCrmConversations";
import { useIsMobile } from "@/hooks/use-mobile";
import clsx from "clsx";

const CrmChat = () => {
  const [filter, setFilter] = useState<"all" | "open" | "closed" | "unanswered">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useCrmConversations({ filter });

  const conversations = data?.pages.flat() || [];
  
  // Resetear selección al cambiar el filtro para no mostrar un chat viejo.
  useEffect(() => {
    setSelectedId(null);
  }, [filter]);

  // Seleccionar la primera conversación si no hay ninguna seleccionada y la carga ha terminado.
  useEffect(() => {
    if (!isMobile && !isLoading && !selectedId && conversations.length > 0) {
      const firstConversationId = conversations[0].id;
      setSelectedId(firstConversationId);
    }
  }, [isLoading, conversations, selectedId, isMobile]);

  const selectedConversation = conversations.find(c => c.id === selectedId);

  const isReadOnly = selectedConversation?.last_message_type === 'mercadolibre_question';

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Lista de conversaciones */}
      <div className={clsx(
        "w-full md:w-96 md:border-r h-full flex-col",
        isMobile && selectedId ? "hidden" : "flex"
      )}>
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Chat
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Badge
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
                className="cursor-pointer"
              >
                Todas
              </Badge>
              <Badge
                variant={filter === "open" ? "default" : "outline"}
                onClick={() => setFilter("open")}
                className="cursor-pointer"
              >
                Abiertas
              </Badge>
              <Badge
                variant={filter === "unanswered" ? "default" : "outline"}
                onClick={() => setFilter("unanswered")}
                className="cursor-pointer"
              >
                Sin responder
              </Badge>
              <Badge
                variant={filter === "closed" ? "default" : "outline"}
                onClick={() => setFilter("closed")}
                className="cursor-pointer"
              >
                Cerradas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 min-h-0">
            <ConversationsList
              conversations={conversations}
              isLoading={isLoading}
              selectedId={selectedId}
              onSelect={id => setSelectedId(id)}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
            />
          </CardContent>
        </Card>
      </div>

      {/* Área de chat */}
      <div className={clsx(
        "flex-1 flex-col h-full",
        isMobile && !selectedId ? "hidden" : "flex"
      )}>
        {selectedConversation ? (
          <ChatView
            companyId={selectedConversation.company_id}
            contactId={selectedConversation.contact_id}
            companyName={selectedConversation.company_name}
            contactName={selectedConversation.contact_name}
            isReadOnly={isReadOnly}
            key={selectedConversation.id}
            onBack={isMobile ? () => setSelectedId(null) : undefined}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {isLoading ? (
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            ) : conversations.length > 0 ? (
              <div className="hidden md:flex items-center">
                <Circle className="h-8 w-8" />
                <span className="ml-2">Selecciona una conversación</span>
              </div>
            ) : (
              <>
                <MessageSquare className="h-8 w-8" />
                <span className="ml-2">No hay conversaciones en este filtro</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmChat;
