import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye } from 'lucide-react';
import { formatCardDate, formatCurrency } from '@/utils/formatters';
import { ReconciliationBatchDetail } from './ReconciliationBatchDetail';
import { generateReconciliationBatchPdf } from '@/services/reconciliationBatchPdfService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface ReconciliationBatchesListProps {
  batches: ReconciliationBatch[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ReconciliationBatchesList({ 
  batches, 
  isLoading, 
  onRefresh 
}: ReconciliationBatchesListProps) {
  const [selectedBatch, setSelectedBatch] = useState<ReconciliationBatch | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getItemCounts = (items: any[]) => {
    const expenses = items.filter(item => item.item_type === 'expense').length;
    const invoices = items.filter(item => item.item_type === 'invoice').length;
    const adjustments = items.filter(item => item.item_type === 'adjustment').length;
    
    return { expenses, invoices, adjustments };
  };

  const handleDownloadPdf = async (batch: ReconciliationBatch) => {
    await generateReconciliationBatchPdf(batch.id);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay lotes de reconciliación
          </h3>
          <p className="text-gray-500">
            Los lotes aparecerán aquí cuando se completen reconciliaciones por lotes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {batches.map((batch) => {
          const itemCounts = getItemCounts(batch.reconciliation_batch_items);
          
          return (
            <Card key={batch.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{batch.batch_number}</h3>
                      <Badge className={getStatusColor(batch.status)}>
                        {batch.status === 'active' ? 'Activo' : 'Cancelado'}
                      </Badge>
                    </div>
                    
                    {batch.description && (
                      <p className="text-gray-600 mb-2">{batch.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>Fecha: {formatCardDate(batch.created_at)}</span>
                      <span>Total: {formatCurrency(batch.total_amount)}</span>
                      <span>
                        Items: {itemCounts.expenses} gastos, {itemCounts.invoices} facturas
                        {itemCounts.adjustments > 0 && `, ${itemCounts.adjustments} ajustes`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedBatch(batch)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPdf(batch)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!selectedBatch} onOpenChange={() => setSelectedBatch(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Detalle del Lote: {selectedBatch?.batch_number}
            </DialogTitle>
          </DialogHeader>
          {selectedBatch && (
            <ReconciliationBatchDetail 
              batch={selectedBatch}
              onClose={() => setSelectedBatch(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
