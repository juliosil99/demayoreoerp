
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ReconciliationBatchesList } from '@/components/reconciliation-batches/ReconciliationBatchesList';
import { ReconciliationBatchFilters } from '@/components/reconciliation-batches/ReconciliationBatchFilters';

interface BatchFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  batchNumber?: string;
}

interface ReconciliationBatch {
  id: string;
  batch_number: string;
  description: string | null;
  total_amount: number;
  status: 'active' | 'cancelled';
  created_at: string;
  notes: string | null;
  reconciliation_batch_items: {
    id: string;
    item_type: string;
    amount: number;
  }[];
}

export default function ReconciliationBatches() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<BatchFilters>({});

  const { data: batches, isLoading, refetch } = useQuery({
    queryKey: ['reconciliation-batches', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];

      let query = supabase
        .from('reconciliation_batches')
        .select(`
          *,
          reconciliation_batch_items (
            id,
            item_type,
            amount
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters.batchNumber) {
        query = query.ilike('batch_number', `%${filters.batchNumber}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData: ReconciliationBatch[] = (data || []).map(batch => ({
        ...batch,
        status: batch.status as 'active' | 'cancelled'
      }));
      
      return transformedData;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="container mx-auto py-4 md:py-6 px-2 md:px-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Lotes de Reconciliación</h1>
      </div>

      <div className="space-y-4">
        <div className="p-2 md:p-4 bg-white rounded-md">
          <ReconciliationBatchFilters 
            filters={filters} 
            onFiltersChange={setFilters} 
          />
        </div>
        
        <ReconciliationBatchesList 
          batches={batches || []} 
          isLoading={isLoading}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}
