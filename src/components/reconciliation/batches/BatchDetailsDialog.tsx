
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Hash, 
  Calendar, 
  FileText, 
  Receipt, 
  CreditCard,
  AlertCircle 
} from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BatchItemsList } from "./BatchItemsList";

interface ReconciliationBatch {
  id: string;
  batch_number: string;
  description: string;
  total_amount: number;
  status: string;
  created_at: string;
  notes: string;
  user_id: string;
}

interface BatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batch: ReconciliationBatch;
}

export function BatchDetailsDialog({ 
  open, 
  onOpenChange, 
  batch 
}: BatchDetailsDialogProps) {
  const { user } = useAuth();

  const { data: batchItems, isLoading } = useQuery({
    queryKey: ["batch-items", batch.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliation_batch_items')
        .select('*')
        .eq('batch_id', batch.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching batch items:", error);
        throw error;
      }

      return data;
    },
    enabled: !!batch.id && open,
  });

  const expenseItems = batchItems?.filter(item => item.item_type === 'expense') || [];
  const invoiceItems = batchItems?.filter(item => item.item_type === 'invoice') || [];
  
  const expenseTotal = expenseItems.reduce((sum, item) => sum + item.amount, 0);
  const invoiceTotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
  const isBalanced = Math.abs(expenseTotal + invoiceTotal) < 0.01;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalles del Lote: {batch.batch_number}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Información General */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Número:</span>
                <span className="text-sm">{batch.batch_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Fecha:</span>
                <span className="text-sm">{formatDate(batch.created_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Estado:</span>
                <Badge variant={batch.status === 'active' ? 'default' : 'secondary'}>
                  {batch.status === 'active' ? 'Activo' : batch.status}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Total:</span>
                <span className="text-lg font-bold">{formatCurrency(batch.total_amount)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Balance:</span>
                {isBalanced ? (
                  <Badge variant="default" className="text-green-600">
                    ✓ Balanceado
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Desbalanceado
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Descripción y Notas */}
          {(batch.description || batch.notes) && (
            <div className="space-y-2">
              {batch.description && (
                <div>
                  <span className="text-sm font-medium">Descripción:</span>
                  <p className="text-sm text-muted-foreground mt-1">{batch.description}</p>
                </div>
              )}
              {batch.notes && (
                <div>
                  <span className="text-sm font-medium">Notas:</span>
                  <p className="text-sm text-muted-foreground mt-1">{batch.notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Resumen de Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Receipt className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Gastos</span>
              </div>
              <p className="text-sm text-blue-700">
                {expenseItems.length} items - {formatCurrency(expenseTotal)}
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">Facturas</span>
              </div>
              <p className="text-sm text-green-700">
                {invoiceItems.length} items - {formatCurrency(invoiceTotal)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Lista de Items */}
          <div className="flex-1 overflow-hidden">
            <h4 className="font-medium mb-3">Items del Lote</h4>
            {isLoading ? (
              <div className="p-4 text-center">Cargando items...</div>
            ) : (
              <ScrollArea className="h-64">
                <BatchItemsList 
                  expenseItems={expenseItems}
                  invoiceItems={invoiceItems}
                />
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
