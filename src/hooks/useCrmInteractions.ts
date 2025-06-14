
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Interaction, InteractionFormData, RawInteractionData, InteractionType, InteractionStatus } from '@/types/crm';
import { toast } from 'sonner';

// Helper function to transform raw data to Interaction type
const transformRawInteraction = (raw: RawInteractionData): Interaction => {
  // Safely cast type with validation
  const validTypes: InteractionType[] = [
    'email', 'call', 'meeting', 'note', 'task', 'sale', 'invoice', 'payment', 'mercadolibre_question', 'mercadolibre_answer',
    'mercadolibre_purchase_inquiry', 'mercadolibre_claim_customer', 'mercadolibre_claim_ml',
    'auto_response_pending', 'auto_response_sent', 'escalated_to_human'
  ];
  const type = validTypes.includes(raw.type as InteractionType) 
    ? raw.type as InteractionType 
    : 'note'; // Default fallback

  const validStatuses: InteractionStatus[] = [
    'open', 'closed', 'pending_response', 'archived', 'auto_processing', 
    'auto_resolved', 'needs_human_review', 'escalated'
  ];
  const conversation_status = raw.conversation_status && validStatuses.includes(raw.conversation_status as InteractionStatus)
    ? raw.conversation_status as InteractionStatus
    : undefined;

  return {
    id: raw.id,
    user_id: raw.user_id,
    company_id: raw.company_id,
    contact_id: raw.contact_id,
    type,
    subject: raw.subject,
    description: raw.description,
    interaction_date: raw.interaction_date,
    outcome: raw.outcome,
    next_follow_up: raw.next_follow_up,
    metadata: (raw.metadata as Record<string, any>) || {},
    created_at: raw.created_at,
    conversation_status,
    company: raw.companies_crm ? {
      id: raw.companies_crm.id,
      name: raw.companies_crm.name,
      user_id: raw.companies_crm.user_id,
      status: 'active' as const,
      engagement_score: 0,
      created_at: '',
      updated_at: ''
    } : undefined,
    contact: raw.contacts ? {
      id: raw.contacts.id,
      name: raw.contacts.name,
      user_id: raw.contacts.user_id,
      company_id: '',
      rfc: '',
      type: 'client',
      is_primary_contact: false,
      engagement_score: 0,
      contact_status: 'active' as const,
      postal_code: '',
      tax_regime: '',
      created_at: ''
    } : undefined
  };
};

const INTERACTIONS_PAGE_SIZE = 30;

export const useCrmInteractions = (companyId?: string, contactId?: string) => {
  return useInfiniteQuery({
    queryKey: ['crm-interactions', companyId, contactId],
    queryFn: async ({ pageParam = 0 }): Promise<Interaction[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const from = pageParam * INTERACTIONS_PAGE_SIZE;
      const to = from + INTERACTIONS_PAGE_SIZE - 1;

      let query = supabase
        .from('interactions')
        .select(`
          *,
          companies_crm (
            id,
            name,
            user_id
          ),
          contacts (
            id,
            name,
            user_id
          )
        `)
        .order('interaction_date', { ascending: false }) // Fetch newest first for pagination
        .range(from, to);

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (contactId) {
        query = query.eq('contact_id', contactId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [useCrmInteractions] Query error:', error.message);
        throw error;
      }
      
      const transformedData = (data || []).map(transformRawInteraction);
      return transformedData;
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < INTERACTIONS_PAGE_SIZE) {
        return undefined; // No more pages
      }
      return allPages.length; // The next page number
    },
    enabled: !!(companyId || contactId),
  });
};

export const useCreateInteraction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (interactionData: Omit<InteractionFormData, 'interaction_date' | 'next_follow_up'> & {
      company_id?: string;
      contact_id?: string;
      interaction_date: string;
      next_follow_up?: string | null;
    }) => {
      console.log('Creating interaction with data:', interactionData);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('Usuario no autenticado');
      }

      const { data, error } = await supabase
        .from('interactions')
        .insert({
          ...interactionData,
          user_id: user.user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating interaction:', error);
        throw error;
      }

      console.log('Created interaction:', data);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-interactions'] });
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      queryClient.invalidateQueries({ queryKey: ['crm-company', data.company_id] });
      toast.success('Interacción registrada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating interaction:', error);
      toast.error('Error al registrar la interacción');
    },
  });
};
