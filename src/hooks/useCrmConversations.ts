
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
      console.log('🔍 [useCrmConversations] Starting query with:', {
        filter,
        pageParam,
        pageSize: CONVERSATIONS_PAGE_SIZE
      });

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('❌ [useCrmConversations] User not authenticated');
        throw new Error("User not authenticated");
      }

      console.log('✅ [useCrmConversations] User authenticated:', user.id);

      const { data, error } = await supabase.rpc('get_crm_conversation_previews', {
        p_user_id: user.id,
        p_filter: filter,
        p_page_size: CONVERSATIONS_PAGE_SIZE,
        p_page_number: pageParam,
      });

      if (error) {
        console.error("❌ [useCrmConversations] Supabase RPC error:", error);
        throw error;
      }
      
      console.log('📊 [useCrmConversations] Raw data from Supabase:', {
        dataLength: data?.length || 0,
        data: data,
        filter,
        pageParam
      });

      // La función RPC devuelve un array de objetos que coinciden con CrmConversationPreview.
      const conversations = (data || []) as CrmConversationPreview[];
      
      console.log('🔄 [useCrmConversations] Transformed conversations:', {
        count: conversations.length,
        conversations: conversations.map(c => ({
          id: c.id,
          company_name: c.company_name,
          contact_name: c.contact_name,
          last_message: c.last_message?.substring(0, 50) + '...',
          status: c.conversation_status
        }))
      });

      return conversations;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      console.log('🔄 [useCrmConversations] Calculating next page:', {
        lastPageLength: lastPage.length,
        pageSize: CONVERSATIONS_PAGE_SIZE,
        allPagesCount: allPages.length
      });

      // Si la última página trajo menos resultados que el tamaño de la página, no hay más.
      if (lastPage.length < CONVERSATIONS_PAGE_SIZE) {
        console.log('🏁 [useCrmConversations] No more pages available');
        return undefined;
      }
      // Si no, pedimos la siguiente página.
      const nextPage = allPages.length + 1;
      console.log('➡️ [useCrmConversations] Next page:', nextPage);
      return nextPage;
    },
  });
}
