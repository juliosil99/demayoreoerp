
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Interaction, InteractionFormData, RawInteractionData } from '@/types/crm';
import { toast } from 'sonner';

// Helper function to transform raw data to Interaction type
const transformRawInteraction = (raw: RawInteractionData): Interaction => {
  // Safely cast type with validation
  const validTypes: Interaction['type'][] = [
    'email', 'call', 'meeting', 'note', 'task', 'sale', 'invoice', 'payment', 'mercadolibre_question'
  ];
  const type = validTypes.includes(raw.type as Interaction['type']) 
    ? raw.type as Interaction['type'] 
    : 'note'; // Default fallback

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

export const useCrmInteractions = (companyId?: string, contactId?: string) => {
  return useQuery({
    queryKey: ['crm-interactions', companyId, contactId],
    queryFn: async (): Promise<Interaction[]> => {
      console.log('🔍 [useCrmInteractions] Starting fetch with filters:', { companyId, contactId });
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ [useCrmInteractions] No authenticated user found');
        return [];
      }

      console.log('✅ [useCrmInteractions] Authenticated user:', user.id);

      // Debug: Check user's company relationships
      const { data: userCompanies } = await supabase
        .from('company_users')
        .select('company_id, role')
        .eq('user_id', user.id);
      
      const { data: ownedCompanies } = await supabase
        .from('companies')
        .select('id, nombre')
        .eq('user_id', user.id);

      console.log('🏢 [useCrmInteractions] User companies (as member):', userCompanies);
      console.log('🏢 [useCrmInteractions] User companies (as owner):', ownedCompanies);

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
        .order('interaction_date', { ascending: true });

      // Apply optional filters
      if (companyId) {
        console.log('🔍 [useCrmInteractions] Filtering by company_id:', companyId);
        query = query.eq('company_id', companyId);
      }
      if (contactId) {
        console.log('🔍 [useCrmInteractions] Filtering by contact_id:', contactId);
        query = query.eq('contact_id', contactId);
      }

      console.log('📡 [useCrmInteractions] Executing query...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ [useCrmInteractions] Query error:', error);
        console.error('❌ [useCrmInteractions] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('📊 [useCrmInteractions] Raw query result:', {
        totalRecords: data?.length || 0,
        firstRecord: data?.[0] || 'No records',
        recordsPreview: data?.slice(0, 3).map(r => ({
          id: r.id,
          type: r.type,
          user_id: r.user_id,
          company_id: r.company_id,
          subject: r.subject
        })) || []
      });

      // Debug: Check if there are any interactions in the database at all
      if (!data || data.length === 0) {
        console.log('🔍 [useCrmInteractions] No data returned, checking total interactions in DB...');
        const { data: totalInteractions, error: totalError } = await supabase
          .from('interactions')
          .select('id, user_id, type, subject')
          .limit(5);
        
        if (totalError) {
          console.error('❌ [useCrmInteractions] Error checking total interactions:', totalError);
        } else {
          console.log('📊 [useCrmInteractions] Total interactions in DB (sample):', totalInteractions);
        }
      }
      
      // Transform raw data to proper Interaction type
      const transformedData = (data || []).map(transformRawInteraction);
      
      console.log('✅ [useCrmInteractions] Successfully transformed interactions:', {
        originalCount: data?.length || 0,
        transformedCount: transformedData.length,
        sampleTransformed: transformedData.slice(0, 2).map(t => ({
          id: t.id,
          type: t.type,
          subject: t.subject,
          company: t.company?.name || 'No company',
          contact: t.contact?.name || 'No contact'
        }))
      });
      
      return transformedData;
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
