
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Interaction, InteractionFormData } from '@/types/crm';
import { toast } from 'sonner';

export const useCrmInteractions = (companyId?: string, contactId?: string) => {
  return useQuery({
    queryKey: ['crm-interactions', companyId, contactId],
    queryFn: async () => {
      console.log('Fetching interactions with filters:', { companyId, contactId });
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No authenticated user found');
        return [];
      }

      console.log('Authenticated user:', user.id);

      // Build query with optional filters
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
        .order('interaction_date', { ascending: false });

      // Apply optional filters
      if (companyId) {
        console.log('Filtering by company_id:', companyId);
        query = query.eq('company_id', companyId);
      }
      if (contactId) {
        console.log('Filtering by contact_id:', contactId);
        query = query.eq('contact_id', contactId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching interactions:', error);
        throw error;
      }

      console.log('Successfully fetched interactions:', data?.length || 0, 'records');
      console.log('Raw interactions data:', data);
      
      // RLS policies will automatically filter by user_id, so we don't need manual filtering
      return data || [];
    },
    enabled: true, // Always enabled, let RLS handle authorization
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
