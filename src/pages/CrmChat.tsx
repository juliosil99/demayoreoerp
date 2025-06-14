import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Circle } from "lucide-react";
import { ConversationsList } from "@/components/crm/chat/ConversationsList";
import { ChatView } from "@/components/crm/chat/ChatView";
import { useCrmConversations } from "@/hooks/useCrmConversations";
import { useCrmDebugger } from "@/hooks/useCrmDebugger";

const CrmChat = () => {
  const [filter, setFilter] = useState<"all" | "open" | "closed" | "unanswered">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage 
  } = useCrmConversations({ filter });

  // Add debug hook
  const { data: debugData, isLoading: isDebugLoading } = useCrmDebugger();

  console.log('📱 [CrmChat] Hook data received:', {
    data: data,
    isLoading,
    dataPages: data?.pages?.length || 0,
    totalPages: data?.pages || []
  });

  // Add debug log
  console.log('🔧 [CrmChat] Debug data:', {
    debugData,
    isDebugLoading
  });

  const conversations = data?.pages.flat() || [];
  
  console.log('📱 [CrmChat] Flattened conversations:', {
    conversationsCount: conversations.length,
    conversations: conversations.map(c => ({
      id: c.id,
      company_name: c.company_name,
      contact_name: c.contact_name,
      last_message: c.last_message?.substring(0, 30) + '...'
    })),
    filter,
    isLoading,
    selectedId
  });

  // Resetear selección al cambiar el filtro para no mostrar un chat viejo.
  useEffect(() => {
    console.log('🔄 [CrmChat] Filter changed, resetting selection:', { filter });
    setSelectedId(null);
  }, [filter]);

  // Seleccionar la primera conversación si no hay ninguna seleccionada y la carga ha terminado.
  useEffect(() => {
    console.log('🎯 [CrmChat] Selection effect triggered:', {
      isLoading,
      selectedId,
      conversationsLength: conversations.length,
      firstConversationId: conversations[0]?.id
    });

    if (!isLoading && !selectedId && conversations.length > 0) {
      const firstConversationId = conversations[0].id;
      console.log('✅ [CrmChat] Auto-selecting first conversation:', firstConversationId);
      setSelectedId(firstConversationId);
    }
  }, [isLoading, conversations, selectedId]);

  const selectedConversation = conversations.find(c => c.id === selectedId);
  console.log('👆 [CrmChat] Selected conversation:', {
    selectedId,
    selectedConversation: selectedConversation ? {
      id: selectedConversation.id,
      company_name: selectedConversation.company_name,
      contact_name: selectedConversation.contact_name
    } : null
  });

  const isReadOnly = selectedConversation?.last_message_type === 'mercadolibre_question';

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">
      {/* Lista de conversaciones */}
      <div className="w-full sm:w-96 border-r h-full flex flex-col">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Chat
            </CardTitle>
            {/* Add debug info */}
            {debugData && (
              <div className="text-xs text-muted-foreground">
                Debug: {debugData.interactions_count} interactions, {debugData.companies_count} companies, {debugData.contacts_count} contacts
              </div>
            )}
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
      <div className="flex-1 flex flex-col h-full">
        {selectedConversation ? (
          <ChatView
            companyId={selectedConversation.company_id}
            contactId={selectedConversation.contact_id}
            companyName={selectedConversation.company_name}
            contactName={selectedConversation.contact_name}
            isReadOnly={isReadOnly}
            key={selectedConversation.id}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            {isLoading ? (
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            ) : conversations.length > 0 ? (
              <>
                <Circle className="h-8 w-8" />
                <span className="ml-2">Selecciona una conversación</span>
              </>
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
