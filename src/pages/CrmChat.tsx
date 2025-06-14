
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Circle } from "lucide-react";
import { ConversationsList } from "@/components/crm/chat/ConversationsList";
import { ChatView } from "@/components/crm/chat/ChatView";
import { useCrmConversations } from "@/hooks/useCrmConversations";
import { ScrollArea } from "@/components/ui/scroll-area";

const CrmChat = () => {
  const [filter, setFilter] = useState<"all" | "open" | "closed" | "unanswered">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: conversations = [], isLoading } = useCrmConversations({ filter });

  // Encontrar conversación seleccionada (o la primera)
  const selectedConversation = conversations.find(c => c.id === selectedId) || conversations[0];
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
            <ScrollArea className="h-full">
              <ConversationsList
                conversations={conversations}
                isLoading={isLoading}
                selectedId={selectedConversation?.id}
                onSelect={id => setSelectedId(id)}
              />
            </ScrollArea>
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
            <Circle className="h-8 w-8" />
            <span className="ml-2">Selecciona una conversación</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmChat;
