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
      try {
        // Verificar la conexión de usuario primero
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error('❌ [useCrmConversations] User authentication error:', userError);
          throw new Error(`Authentication error: ${userError.message}`);
        }
        
        if (!user) {
          console.error('❌ [useCrmConversations] User not authenticated');
          throw new Error("User not authenticated");
        }

        // Hacer la llamada RPC con mejor manejo de errores
        const rpcParams = {
          p_user_id: user.id,
          p_filter: filter,
          p_page_size: CONVERSATIONS_PAGE_SIZE,
          p_page_number: pageParam,
        };
        
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
      // Si la última página trajo menos resultados que el tamaño de la página, no hay más.
      if (lastPage.length < CONVERSATIONS_PAGE_SIZE) {
        return undefined;
      }
      // Si no, pedimos la siguiente página.
      const nextPage = allPages.length + 1;
      return nextPage;
    },
    retry: (failureCount, error) => {
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}
