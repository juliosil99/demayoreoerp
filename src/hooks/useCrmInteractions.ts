
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Interaction, InteractionFormData } from '@/types/crm';
import { toast } from 'sonner';

export const useCrmInteractions = (companyId?: string, contactId?: string) => {
  return useQuery({
    queryKey: ['crm-interactions', companyId, contactId],
    queryFn: async () => {
      let query = supabase
        .from('interactions')
        .select(`
          *,
          companies_crm (name),
          contacts (name)
        `)
        .order('interaction_date', { ascending: false });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (contactId) {
        query = query.eq('contact_id', contactId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as any[];
    },
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
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          ...interactionData,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
        })
        .select()
        .single();

      if (error) throw error;
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
