
import { useInfiniteQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// El estado de la conversación ahora puede ser un string genérico, ya que la función de la BD devuelve 'text'.
export type CrmConversationStatus = "open" | "closed" | "pending_response" | "archived" | string;

// Se mantiene la misma estructura para la vista previa.
export interface CrmConversationPreview {
  id: string; 
  company_id?: string;
  company_name?: string;
  contact_id?: string;
  contact_name?: string;
  last_message: string;
  last_message_time: string;
  last_message_type: string;
  unread_count: number;
  conversation_status: CrmConversationStatus;
}

export interface UseCrmConversationsOptions {
  filter: "all" | "open" | "closed" | "unanswered";
}

const CONVERSATIONS_PAGE_SIZE = 25;

export function useCrmConversations({ filter }: UseCrmConversationsOptions) {
  return useInfiniteQuery({
    queryKey: ["crm-conversations", filter],
    queryFn: async ({ pageParam }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase.rpc('get_crm_conversation_previews', {
        p_user_id: user.id,
        p_filter: filter,
        p_page_size: CONVERSATIONS_PAGE_SIZE,
        p_page_number: pageParam,
      });

      if (error) {
        console.error("Error fetching conversations:", error);
        throw error;
      }
      
      // La función RPC devuelve un array de objetos que coinciden con CrmConversationPreview.
      return (data || []) as CrmConversationPreview[];
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      // Si la última página trajo menos resultados que el tamaño de la página, no hay más.
      if (lastPage.length < CONVERSATIONS_PAGE_SIZE) {
        return undefined;
      }
      // Si no, pedimos la siguiente página.
      return allPages.length + 1;
    },
  });
}
