
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Building2, User } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

const getStatusProps = (conv: ConversationPreview) => {
  // Las preguntas de ML siempre se tratan como cerradas en la UI
  const isMercadoLibre = conv.last_message_type === 'mercadolibre_question';
  const effectiveStatus = isMercadoLibre ? 'closed' : conv.conversation_status;

  switch (effectiveStatus) {
    case 'closed':
      return {
        text: 'Cerrada',
        className: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        variant: 'outline' as const,
      };
    case 'pending_response':
      return {
        text: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        variant: 'default' as const,
      };
    case 'open':
    default:
      return {
        text: 'Abierta',
        className: 'bg-green-100 text-green-800 border-green-200',
        variant: 'default' as const,
      };
  }
};


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
          {conversations.map(conv => {
            const statusProps = getStatusProps(conv);
            const timeAgo = formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true, locale: es });

            return (
              <li
                key={conv.id}
                className={`flex items-center gap-3 px-4 py-3 border-b cursor-pointer transition-colors
                  ${conv.id === selectedId ? "bg-muted" : "hover:bg-accent"}
                `}
                onClick={() => onSelect(conv.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-medium truncate flex items-center gap-2">
                      {conv.company_name ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          {conv.company_name}
                        </span>
                      ) : null}
                      {conv.contact_name && (
                        <>
                          {conv.company_name && <span className="mx-1 text-muted-foreground text-xs">/</span>}
                           <span className="flex items-center gap-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {conv.contact_name}
                          </span>
                        </>
                      )}
                    </div>
                     <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo}</span>
                  </div>

                  <div className="text-muted-foreground text-sm truncate mb-2">
                    {conv.last_message}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant={statusProps.variant} className={statusProps.className}>
                      {statusProps.text}
                    </Badge>
                     {conv.unread_count > 0 && (
                      <div className="bg-blue-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">{conv.unread_count}</div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
