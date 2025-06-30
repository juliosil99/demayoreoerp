
import { useAuth } from "@/contexts/AuthContext";
import { useUserCompany } from "@/hooks/useUserCompany";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet } from "lucide-react";
import { ReconciliationTable } from "@/components/reconciliation/ReconciliationTable";
import { BatchReconciliationDialog } from "@/components/reconciliation/components/BatchReconciliationDialog";
import { useOptimizedExpenses } from "@/components/reconciliation/hooks/useOptimizedExpenses";
import { useOptimizedInvoices } from "@/components/reconciliation/hooks/useOptimizedInvoices";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const Reconciliation = () => {
  const { user } = useAuth();
  const { data: userCompany } = useUserCompany();
  const { hasPermission } = usePermissions();
  const queryClient = useQueryClient();
  const [showBatchDialog, setShowBatchDialog] = useState(false);

  // Check if user has reconciliation permission
  const canViewReconciliation = hasPermission('can_view_reconciliation');

  // Show access denied if user doesn't have permission
  if (!canViewReconciliation) {
    return (
      <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Conciliación de Gastos</h1>
        
        <Card className="shadow-sm">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl text-red-600">
              Acceso Denegado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              No tienes permisos para acceder al módulo de reconciliación. 
              Contacta a tu administrador para obtener los permisos necesarios.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleBatchSuccess = () => {
    // Invalidate queries to refresh the data
    queryClient.invalidateQueries({ queryKey: ["optimized-expenses"] });
    queryClient.invalidateQueries({ queryKey: ["optimized-invoices"] });
    queryClient.invalidateQueries({ queryKey: ["reconciliation-batches"] });
  };

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold">Conciliación de Gastos</h1>
        
        <Button
          onClick={() => setShowBatchDialog(true)}
          className="flex items-center gap-2"
          variant="outline"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Reconciliación en Lotes
        </Button>
      </div>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">
            Reconciliación Individual
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Selecciona un gasto y busca la factura correspondiente para reconciliar uno a uno.
            Para reconciliar múltiples gastos y facturas a la vez, usa la "Reconciliación en Lotes".
          </p>
        </CardHeader>
        <CardContent>
          <ReconciliationTable />
        </CardContent>
      </Card>

      <BatchReconciliationDialog
        open={showBatchDialog}
        onOpenChange={setShowBatchDialog}
        onSuccess={handleBatchSuccess}
      />
    </div>
  );
};

export default Reconciliation;
