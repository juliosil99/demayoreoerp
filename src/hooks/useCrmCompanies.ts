
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Company, CompanyFormData } from '@/types/crm';
import { toast } from 'sonner';

export const useCrmCompanies = () => {
  return useQuery({
    queryKey: ['crm-companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies_crm')
        .select(`
          *,
          company_tags (
            tags (*)
          ),
          contacts (
            id,
            name,
            job_title,
            is_primary_contact,
            engagement_score
          )
        `)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });
};

export const useCrmCompany = (id: string) => {
  return useQuery({
    queryKey: ['crm-company', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies_crm')
        .select(`
          *,
          company_tags (
            tags (*)
          ),
          contacts (*),
          interactions (
            *,
            contacts (name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (companyData: Omit<CompanyFormData, 'founded_year' | 'employee_count' | 'annual_revenue'> & {
      founded_year?: number | null;
      employee_count?: number | null;
      annual_revenue?: number | null;
    }) => {
      const { data, error } = await supabase
        .from('companies_crm')
        .insert({
          ...companyData,
          user_id: (await supabase.auth.getUser()).data.user?.id!,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      toast.success('Empresa creada exitosamente');
    },
    onError: (error) => {
      console.error('Error creating company:', error);
      toast.error('Error al crear la empresa');
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Omit<CompanyFormData, 'founded_year' | 'employee_count' | 'annual_revenue'> & {
      founded_year?: number | null;
      employee_count?: number | null;
      annual_revenue?: number | null;
    }>) => {
      const { data, error } = await supabase
        .from('companies_crm')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      queryClient.invalidateQueries({ queryKey: ['crm-company', data.id] });
      toast.success('Empresa actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Error updating company:', error);
      toast.error('Error al actualizar la empresa');
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('companies_crm')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      toast.success('Empresa eliminada exitosamente');
    },
    onError: (error) => {
      console.error('Error deleting company:', error);
      toast.error('Error al eliminar la empresa');
    },
  });
};
