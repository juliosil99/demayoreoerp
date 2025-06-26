
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { useNavigate } from "react-router-dom";

interface BatchQuickViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  batchId: string;
}

export function BatchQuickViewDialog({ 
  open, 
  onOpenChange, 
  batchId 
}: BatchQuickViewDialogProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: batch, isLoading } = useQuery({
    queryKey: ["batch-quick-view", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliation_batches')
        .select('*')
        .eq('id', batchId)
        .single();

      if (error) {
        console.error("Error fetching batch:", error);
        throw error;
      }

      return data;
    },
    enabled: !!batchId && open,
  });

  const { data: itemsCount } = useQuery({
    queryKey: ["batch-items-count", batchId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliation_batch_items')
        .select('item_type')
        .eq('batch_id', batchId);

      if (error) {
        console.error("Error fetching batch items count:", error);
        throw error;
      }

      const expenses = data.filter(item => item.item_type === 'expense').length;
      const invoices = data.filter(item => item.item_type === 'invoice').length;
      
      return { expenses, invoices, total: data.length };
    },
    enabled: !!batchId && open,
  });

  const handleViewFullDetails = () => {
    onOpenChange(false);
    navigate('/reconciliation-batches');
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="p-4 text-center">Cargando información del lote...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!batch) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="p-4 text-center text-red-600">
            No se pudo cargar la información del lote
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {batch.batch_number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Total:</span>
              <span className="font-bold">{formatCurrency(batch.total_amount)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Fecha:</span>
              <span className="text-sm">{formatDate(batch.created_at)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Estado:</span>
              <Badge variant={batch.status === 'active' ? 'default' : 'secondary'}>
                {batch.status === 'active' ? 'Activo' : batch.status}
              </Badge>
            </div>
          </div>

          {itemsCount && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800 mb-1">Items incluidos:</p>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• {itemsCount.expenses} gastos</p>
                <p>• {itemsCount.invoices} facturas</p>
                <p className="font-medium">Total: {itemsCount.total} items</p>
              </div>
            </div>
          )}

          {batch.description && (
            <div>
              <span className="text-sm font-medium">Descripción:</span>
              <p className="text-sm text-muted-foreground mt-1">{batch.description}</p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={handleViewFullDetails}
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver Detalles Completos
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
