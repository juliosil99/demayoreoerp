
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Interaction } from "@/types/crm";

export interface ConversationGroup {
  conversationKey: string;
  companyName?: string;
  contactName?: string;
  channel: string;
  latest: Interaction;
  unreadCount: number;
  status: string;
  allInteractions: Interaction[];
}

function getKey(interaction: Interaction) {
  // agrupamos por empresa, contacto y canal
  return [
    interaction.company_id || "none",
    interaction.contact_id || "none",
    interaction.type || "generic"
  ].join("__");
}

export const useCrmConversations = () => {
  return useQuery({
    queryKey: ["crm-conversations"],
    queryFn: async (): Promise<ConversationGroup[]> => {
      const { data, error } = await supabase
        .from("interactions")
        .select(
          "*, companies_crm(id, name), contacts(id, name)"
        )
        .order("interaction_date", { ascending: false });

      if (error) throw error;

      // Agrupar por conversación
      const groups: Record<string, ConversationGroup> = {};
      (data || []).forEach((i) => {
        const key = getKey(i);
        if (!groups[key]) {
          groups[key] = {
            conversationKey: key,
            companyName: i.companies_crm?.name,
            contactName: i.contacts?.name,
            channel: i.type,
            latest: i,
            unreadCount: 0,
            status: i.conversation_status || "open",
            allInteractions: [],
          };
        }
        // siempre inserta por orden fecha descendente
        groups[key].allInteractions.push(i);
        // primer registro es el más reciente
        if (groups[key].latest.interaction_date < i.interaction_date) {
          groups[key].latest = i;
        }
        if (!i.is_read) groups[key].unreadCount += 1;
      });

      return Object.values(groups).sort(
        (a, b) =>
          new Date(b.latest.interaction_date).getTime() -
          new Date(a.latest.interaction_date).getTime()
      );
    },
  });
};
