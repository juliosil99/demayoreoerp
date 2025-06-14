
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

function getKey(i: any) {
  return [
    i.company_id || "none",
    i.contact_id || "none",
    i.type || "generic"
  ].join("__");
}

// helper to sanitize `type`
const allowedTypes: Interaction["type"][] = [
  "email",
  "invoice",
  "call",
  "meeting",
  "note",
  "task",
  "sale",
  "payment",
  "mercadolibre_question"
];
function sanitizeInteraction(supabaseRow: any): Interaction {
  const type =
    allowedTypes.includes(supabaseRow.type)
      ? supabaseRow.type
      : allowedTypes.includes(String(supabaseRow.type))
      ? (supabaseRow.type as Interaction["type"])
      : "note";
  return {
    ...supabaseRow,
    type,
  };
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

      const groups: Record<string, ConversationGroup> = {};
      (data || []).forEach((rawI) => {
        const i = sanitizeInteraction(rawI);
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
        groups[key].allInteractions.push(i);
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
