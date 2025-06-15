
import { Badge } from "@/components/ui/badge";
import { Building2, User } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ConversationPreview } from './types';
import { getStatusProps } from './utils';

interface ConversationListItemProps {
  conversation: ConversationPreview;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export const ConversationListItem = ({ conversation: conv, isSelected, onSelect }: ConversationListItemProps) => {
  const statusProps = getStatusProps(conv);
  const timeAgo = formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: true, locale: es });

  return (
    <li
      className={`flex items-start gap-3 px-4 py-3 border-b cursor-pointer transition-colors
        ${isSelected ? "bg-muted" : "hover:bg-accent"}
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
};
