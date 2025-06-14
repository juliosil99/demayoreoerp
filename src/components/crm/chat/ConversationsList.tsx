import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Building2, User } from "lucide-react";

export interface ConversationPreview {
  id: string;
  company_name?: string;
  contact_name?: string;
  last_message: string;
  last_message_time: string;
  last_message_type: string;
  unread_count: number;
  conversation_status: "open" | "closed" | "pending_response" | "archived";
}

interface ConversationsListProps {
  conversations: ConversationPreview[];
  isLoading: boolean;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export const ConversationsList = ({
  conversations,
  isLoading,
  selectedId,
  onSelect,
}: ConversationsListProps) => {
  if (isLoading) {
    return (
      <div className="py-4 space-y-2">
        {[...Array(7)].map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg mx-3" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {conversations.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-2" />
          <p>No hay conversaciones</p>
        </div>
      ) : (
        <ul>
          {conversations.map(conv => (
            <li
              key={conv.id}
              className={`flex items-center gap-2 px-4 py-3 border-b cursor-pointer transition-colors
                ${conv.id === selectedId ? "bg-muted" : "hover:bg-accent"}
              `}
              onClick={() => onSelect(conv.id)}
            >
              <div>
                <Badge
                  variant={conv.conversation_status === "closed" ? "outline" : "default"}
                  className={
                    conv.conversation_status === "closed"
                      ? "bg-gray-200 text-gray-600"
                      : "bg-green-100 text-green-900"
                  }
                >
                  {conv.conversation_status === "closed" ? "Cerrada" : "Abierta"}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {conv.company_name ? (
                    <>
                      <Building2 className="inline h-4 w-4 mr-1" />
                      {conv.company_name}
                    </>
                  ) : null}
                  {conv.contact_name && (
                    <>
                      <span className="mx-1 text-muted-foreground text-xs">/</span>
                      <User className="inline h-4 w-4 mr-1" />
                      {conv.contact_name}
                    </>
                  )}
                </div>
                <div className="text-muted-foreground text-xs truncate">
                  {conv.last_message}
                </div>
              </div>
              <div className="text-xs text-muted-foreground flex flex-col items-end">
                <span>{conv.last_message_time}</span>
                {conv.unread_count > 0 && (
                  <div className="bg-blue-500 text-white rounded-full px-2 mt-1 text-xs">{conv.unread_count}</div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
