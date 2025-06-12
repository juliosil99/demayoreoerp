
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Interaction, InteractionFormData } from '@/types/crm';
import { toast } from 'sonner';

export const useCrmInteractions = (companyId?: string, contactId?: string) => {
  return useQuery({
    queryKey: ['crm-interactions', companyId, contactId],
    queryFn: async () => {
      console.log('Fetching interactions with filters:', { companyId, contactId });
      
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

      // Aplicar filtros opcionales
      if (companyId) {
        query = query.eq('company_id', companyId);
      }
      if (contactId) {
        query = query.eq('contact_id', contactId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching interactions:', error);
        throw error;
      }

      console.log('Raw interactions data:', data);
      
      // Filtrar las interacciones para incluir aquellas que:
      // 1. Pertenecen al usuario actual
      // 2. O están asociadas a empresas/contactos del usuario actual
      const filteredData = data?.filter((interaction: any) => {
        const hasCompanyAccess = !interaction.companies_crm || 
          (interaction.companies_crm && interaction.companies_crm.user_id);
        const hasContactAccess = !interaction.contacts || 
          (interaction.contacts && interaction.contacts.user_id);
        
        return hasCompanyAccess && hasContactAccess;
      }) || [];

      console.log('Filtered interactions:', filteredData);
      
      return filteredData as any[];
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
