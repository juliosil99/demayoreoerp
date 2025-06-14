
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

const CONVERSATIONS_PAGE_SIZE = 20;

export function useCrmConversations({ filter }: UseCrmConversationsOptions) {
  return useInfiniteQuery({
    queryKey: ["crm-conversations", filter],
    queryFn: async ({ pageParam }) => {
      console.log('🔍 [useCrmConversations] Starting query with:', {
        filter,
        pageParam,
        pageSize: CONVERSATIONS_PAGE_SIZE
      });

      try {
        // Verificar la conexión de usuario primero
        console.log('🔐 [useCrmConversations] Checking user authentication...');
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('❌ [useCrmConversations] User authentication error:', userError);
          throw new Error(`Authentication error: ${userError.message}`);
        }
        
        if (!user) {
          console.error('❌ [useCrmConversations] User not authenticated');
          throw new Error("User not authenticated");
        }

        console.log('✅ [useCrmConversations] User authenticated:', user.id);

        // Hacer la llamada RPC con mejor manejo de errores
        console.log('📞 [useCrmConversations] Calling RPC function...');
        const rpcParams = {
          p_user_id: user.id,
          p_filter: filter,
          p_page_size: CONVERSATIONS_PAGE_SIZE,
          p_page_number: pageParam,
        };
        
        console.log('📋 [useCrmConversations] RPC parameters:', rpcParams);

        const { data, error } = await supabase.rpc('get_crm_conversation_previews', rpcParams);

        if (error) {
          console.error("❌ [useCrmConversations] Supabase RPC error details:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          throw new Error(`RPC Error: ${error.message}`);
        }
        
        console.log('📊 [useCrmConversations] Raw RPC response:', {
          dataType: typeof data,
          isArray: Array.isArray(data),
          dataLength: data?.length || 0,
          data: data,
          filter,
          pageParam
        });

        // Verificar que los datos sean válidos
        if (data === null || data === undefined) {
          console.warn('⚠️ [useCrmConversations] RPC returned null/undefined');
          return [];
        }

        if (!Array.isArray(data)) {
          console.error('❌ [useCrmConversations] RPC returned non-array:', typeof data, data);
          throw new Error(`Invalid response format: expected array, got ${typeof data}`);
        }

        // La función RPC devuelve un array de objetos que coinciden con CrmConversationPreview.
        const conversations = data as CrmConversationPreview[];
        
        console.log('🔄 [useCrmConversations] Processed conversations:', {
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

      } catch (error) {
        console.error('💥 [useCrmConversations] Critical error in queryFn:', {
          error: error,
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        throw error;
      }
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
    retry: (failureCount, error) => {
      console.log('🔄 [useCrmConversations] Query retry attempt:', {
        failureCount,
        error: error instanceof Error ? error.message : error
      });
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
