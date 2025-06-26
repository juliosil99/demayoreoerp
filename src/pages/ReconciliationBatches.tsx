
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconciliationBatchesList } from "@/components/reconciliation/batches/ReconciliationBatchesList";

const ReconciliationBatches = () => {
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // Check if user has reconciliation permission
  const canViewReconciliation = hasPermission('can_view_reconciliation');

  // Show access denied if user doesn't have permission
  if (!canViewReconciliation) {
    return (
      <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Lotes de Reconciliación</h1>
        
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

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Lotes de Reconciliación</h1>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">
            Historial de Lotes de Reconciliación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReconciliationBatchesList />
        </CardContent>
      </Card>
    </div>
  );
};

export default ReconciliationBatches;
