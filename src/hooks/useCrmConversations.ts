
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Tipos mínimos para el hook (ajustar según la BD)
export type CrmConversationStatus = "open" | "closed" | "pending_response" | "archived";

// Estructura simplificada de una conversación agrupada
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

export function useCrmConversations({ filter }: UseCrmConversationsOptions) {
  return useQuery({
    queryKey: ["crm-conversations", filter],
    queryFn: async (): Promise<CrmConversationPreview[]> => {
      // Puedes modificar este query según convenga a tus tablas
      let query = supabase
        .from("interactions")
        .select(
          `
            id,
            company_id,
            contact_id,
            company:companies_crm(name),
            contact:contacts(name),
            description,
            type,
            conversation_status,
            created_at,
            is_read
          `
        );

      // Filtros de conversación - CORREGIDO para excluir correctamente ML
      if (filter === "open") {
        // Excluir explícitamente las preguntas de Mercado Libre del filtro "open"
        query = query
          .eq("conversation_status", "open")
          .neq("type", "mercadolibre_question");
      }
      if (filter === "closed") {
        // Incluye las marcadas como 'closed' Y también todas las de Mercado Libre
        query = query.or("conversation_status.eq.closed,type.eq.mercadolibre_question");
      }
      if (filter === "unanswered") {
        // Excluir explícitamente las preguntas de Mercado Libre del filtro "unanswered"
        query = query
          .eq("conversation_status", "pending_response")
          .neq("type", "mercadolibre_question");
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      // Agrupar: aquí cada interacción es una conversación,
      // pero deberías agrupar por company_id+contact_id si hay varias
      // (este mock asume que ya están agrupadas por backend)
      return (data || []).map((item: any) => {
        const isMercadoLibre = item.type === 'mercadolibre_question';
        return {
          id: item.id,
          company_id: item.company_id,
          company_name: item.company?.name ?? "",
          contact_id: item.contact_id,
          contact_name: item.contact?.name ?? "",
          last_message: item.description || "",
          last_message_time: item.created_at,
          last_message_type: item.type,
          // CORREGIDO: Las preguntas de ML nunca deben mostrar contador de no leídas
          unread_count: isMercadoLibre ? 0 : (item.is_read === false ? 1 : 0),
          // CORREGIDO: Las preguntas de ML siempre se marcan como cerradas
          conversation_status: isMercadoLibre ? "closed" : (item.conversation_status || "open")
        };
      });
    }
  });
}
