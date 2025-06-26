import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Receipt } from 'lucide-react';
import { formatCardDate, formatCurrency } from '@/utils/formatters';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateReconciliationBatchPdf } from '@/services/reconciliationBatchPdfService';

interface ReconciliationBatch {
  id: string;
  batch_number: string;
  description: string | null;
  total_amount: number;
  status: 'active' | 'cancelled';
  created_at: string;
  notes: string | null;
}

interface ReconciliationBatchDetailProps {
  batch: ReconciliationBatch;
  onClose: () => void;
}

interface BatchItem {
  id: string;
  item_type: string;
  item_id: string;
  amount: number;
  description: string | null;
}

export function ReconciliationBatchDetail({ batch, onClose }: ReconciliationBatchDetailProps) {
  const { data: batchItems, isLoading } = useQuery({
    queryKey: ['reconciliation-batch-detail', batch.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliation_batch_items')
        .select('*')
        .eq('batch_id', batch.id);

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch expense details for expense items
  const { data: expenseDetails } = useQuery({
    queryKey: ['batch-expenses', batch.id],
    queryFn: async () => {
      if (!batchItems?.length) return [];
      
      const expenseIds = batchItems
        .filter(item => item.item_type === 'expense')
        .map(item => item.item_id);
      
      if (expenseIds.length === 0) return [];

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          description,
          amount,
          date,
          contacts (name),
          bank_accounts (name)
        `)
        .in('id', expenseIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!batchItems?.length,
  });

  // Fetch invoice details for invoice items
  const { data: invoiceDetails } = useQuery({
    queryKey: ['batch-invoices', batch.id],
    queryFn: async () => {
      if (!batchItems?.length) return [];
      
      const invoiceIds = batchItems
        .filter(item => item.item_type === 'invoice')
        .map(item => parseInt(item.item_id));
      
      if (invoiceIds.length === 0) return [];

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          invoice_number,
          total_amount,
          invoice_date,
          issuer_name,
          file_path,
          uuid
        `)
        .in('id', invoiceIds);

      if (error) throw error;
      return data || [];
    },
    enabled: !!batchItems?.length,
  });

  const expenses = batchItems?.filter(item => item.item_type === 'expense') || [];
  const invoices = batchItems?.filter(item => item.item_type === 'invoice') || [];
  const adjustments = batchItems?.filter(item => item.item_type === 'adjustment') || [];

  const handleDownloadPDF = async () => {
    await generateReconciliationBatchPdf(batch.id);
  };

  const handleDownloadAllInvoices = () => {
    // TODO: Implementar descarga en ZIP de todas las facturas
    console.log('Descargar todas las facturas del lote:', batch.id);
  };

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

  return (
    <div className="space-y-6">
      {/* Resumen del Lote */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-3">
                {batch.batch_number}
                <Badge className={getStatusColor(batch.status)}>
                  {batch.status === 'active' ? 'Activo' : 'Cancelado'}
                </Badge>
              </CardTitle>
              {batch.description && (
                <p className="text-gray-600 mt-2">{batch.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <FileText className="w-4 h-4 mr-2" />
                Descargar PDF
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadAllInvoices}>
                <Download className="w-4 h-4 mr-2" />
                Facturas ZIP
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-500">Fecha de Creación:</span>
              <div>{formatCardDate(batch.created_at)}</div>
            </div>
            <div>
              <span className="font-medium text-gray-500">Total del Lote:</span>
              <div className="text-lg font-semibold">{formatCurrency(batch.total_amount)}</div>
            </div>
            <div>
              <span className="font-medium text-gray-500">Items Incluidos:</span>
              <div>
                {expenses.length} gastos, {invoices.length} facturas
                {adjustments.length > 0 && `, ${adjustments.length} ajustes`}
              </div>
            </div>
          </div>
          {batch.notes && (
            <div className="mt-4 pt-4 border-t">
              <span className="font-medium text-gray-500">Notas:</span>
              <p className="mt-1 text-gray-700">{batch.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detalle de Items */}
      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="expenses">Gastos ({expenses.length})</TabsTrigger>
          <TabsTrigger value="invoices">Facturas ({invoices.length})</TabsTrigger>
          <TabsTrigger value="adjustments">Ajustes ({adjustments.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Cargando gastos...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay gastos en este lote</div>
          ) : (
            <div className="space-y-3">
              {expenses.map((item) => {
                const expenseDetail = expenseDetails?.find(e => e.id === item.item_id);
                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.description || expenseDetail?.description || 'Sin descripción'}</h4>
                        <div className="text-sm text-gray-500 mt-1">
                          <div>Proveedor: {expenseDetail?.contacts?.name || 'N/A'}</div>
                          <div>Cuenta: {expenseDetail?.bank_accounts?.name || 'N/A'}</div>
                          <div>Fecha: {expenseDetail?.date ? formatCardDate(expenseDetail.date) : 'N/A'}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.amount)}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Cargando facturas...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay facturas en este lote</div>
          ) : (
            <div className="space-y-3">
              {invoices.map((item) => {
                const invoiceDetail = invoiceDetails?.find(inv => inv.id === parseInt(item.item_id));
                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{invoiceDetail?.invoice_number || 'Sin número'}</h4>
                        <div className="text-sm text-gray-500 mt-1">
                          <div>Emisor: {invoiceDetail?.issuer_name || 'N/A'}</div>
                          <div>Fecha: {invoiceDetail?.invoice_date ? formatCardDate(invoiceDetail.invoice_date) : 'N/A'}</div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div className="font-semibold">{formatCurrency(item.amount)}</div>
                        {invoiceDetail?.file_path && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const url = `https://dulmmxtkgqkcfovvfxzu.supabase.co/storage/v1/object/public/invoices/${invoiceDetail?.uuid}`;
                              window.open(url, '_blank');
                            }}
                          >
                            <Receipt className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="adjustments" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Cargando ajustes...</div>
          ) : adjustments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No hay ajustes en este lote</div>
          ) : (
            <div className="space-y-3">
              {adjustments.map((item) => (
                <Card key={item.id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.description || 'Ajuste'}</h4>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.amount)}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
