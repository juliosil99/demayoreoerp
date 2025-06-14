
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Tipos mínimos para el hook (ajustar según la BD)
export type CrmConversationStatus = "open" | "closed" | "pending_response" | "archived";

// Estructura simplificada de una conversación agrupada
export interface CrmConversationPreview {
  id: string; // Será el ID del grupo, ej: "comp_123-cont_456"
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
      // 1. Obtener todas las interacciones, ordenadas por fecha de creación.
      const { data, error } = await supabase
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
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      if (!data) return [];

      // 2. Agrupar interacciones en conversaciones únicas por cliente.
      const conversationsMap = new Map<string, any[]>();
      data.forEach((interaction) => {
        // La clave de grupo es por compañía/contacto. Si no tiene, es una conversación individual.
        const groupId =
          interaction.company_id || interaction.contact_id
            ? `comp_${interaction.company_id || 'none'}-cont_${interaction.contact_id || 'none'}`
            : `int_${interaction.id}`;
        
        if (!conversationsMap.has(groupId)) {
          conversationsMap.set(groupId, []);
        }
        conversationsMap.get(groupId)!.push(interaction);
      });

      // 3. Procesar cada grupo para crear una vista previa de la conversación.
      const processedGroups = Array.from(conversationsMap.entries()).map(([groupId, group]) => {
        const latestInteraction = group[group.length - 1]; // El último es el más reciente.
        const containsML = group.some(i => i.type === 'mercadolibre_question');
        
        // Las conversaciones de ML no tienen "no leídos" y siempre están "cerradas".
        const unread_count = containsML ? 0 : group.filter(i => i.is_read === false).length;
        const effectiveStatus = containsML ? "closed" : (latestInteraction.conversation_status || "open");

        return {
          preview: {
            id: groupId, // Usamos el ID del grupo para la selección en la UI.
            company_id: latestInteraction.company_id,
            company_name: latestInteraction.company?.name ?? "",
            contact_id: latestInteraction.contact_id,
            contact_name: latestInteraction.contact?.name ?? "",
            last_message: latestInteraction.description || "",
            last_message_time: latestInteraction.created_at,
            last_message_type: latestInteraction.type,
            unread_count,
            conversation_status: effectiveStatus,
          },
          containsML
        };
      });

      // 4. Aplicar filtros a las conversaciones ya agrupadas.
      let filteredGroups = processedGroups;
      if (filter !== "all") {
        filteredGroups = processedGroups.filter(g => {
          if (filter === 'open') {
            return g.preview.conversation_status === 'open' && !g.containsML;
          }
          if (filter === 'closed') {
            // El estado 'closed' ya incluye las conversaciones de ML.
            return g.preview.conversation_status === 'closed';
          }
          if (filter === 'unanswered') {
            return g.preview.conversation_status === 'pending_response' && !g.containsML;
          }
          return false;
        });
      }

      // 5. Ordenar las conversaciones (más recientes arriba) y devolver el resultado.
      const previews: CrmConversationPreview[] = filteredGroups
        .map(g => g.preview)
        .sort((a, b) => new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime());

      return previews;
    },
  });
}
