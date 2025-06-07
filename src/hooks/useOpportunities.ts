
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Opportunity, OpportunityFormData } from '@/types/pipeline';
import { toast } from 'sonner';

export function useOpportunities() {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async (): Promise<Opportunity[]> => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          stage:pipeline_stages(*),
          company:companies_crm(id, name),
          contact:contacts(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OpportunityFormData) => {
      const { data: result, error } = await supabase
        .from('opportunities')
        .insert({
          title: data.title,
          description: data.description,
          value: parseFloat(data.value) || 0,
          currency: data.currency,
          company_id: data.company_id || null,
          contact_id: data.contact_id || null,
          stage_id: data.stage_id,
          probability: data.probability,
          expected_close_date: data.expected_close_date || null,
          source: data.source,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['recent-interactions'] });
      toast.success('Oportunidad creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating opportunity:', error);
      toast.error('Error al crear la oportunidad');
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<OpportunityFormData> }) => {
      const updateData: any = {};
      
      if (data.title) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.value) updateData.value = parseFloat(data.value);
      if (data.currency) updateData.currency = data.currency;
      if (data.company_id !== undefined) updateData.company_id = data.company_id || null;
      if (data.contact_id !== undefined) updateData.contact_id = data.contact_id || null;
      if (data.stage_id) updateData.stage_id = data.stage_id;
      if (data.probability !== undefined) updateData.probability = data.probability;
      if (data.expected_close_date !== undefined) updateData.expected_close_date = data.expected_close_date || null;
      if (data.source !== undefined) updateData.source = data.source;

      const { data: result, error } = await supabase
        .from('opportunities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Oportunidad actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating opportunity:', error);
      toast.error('Error al actualizar la oportunidad');
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Oportunidad eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting opportunity:', error);
      toast.error('Error al eliminar la oportunidad');
    },
  });
}
