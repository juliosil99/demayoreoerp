
import { MessageSquare } from "lucide-react";

export const ConversationListEmpty = () => (
  <div className="py-8 text-center text-muted-foreground">
    <MessageSquare className="mx-auto mb-2" />
    <p>No hay conversaciones en este filtro.</p>
  </div>
);
