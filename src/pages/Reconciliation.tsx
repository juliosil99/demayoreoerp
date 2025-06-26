
import { useAuth } from "@/contexts/AuthContext";
import { useUserCompany } from "@/hooks/useUserCompany";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconciliationTable } from "@/components/reconciliation/ReconciliationTable";
import { useOptimizedExpenses } from "@/components/reconciliation/hooks/useOptimizedExpenses";
import { useOptimizedInvoices } from "@/components/reconciliation/hooks/useOptimizedInvoices";

const Reconciliation = () => {
  const { user } = useAuth();
  const { data: userCompany } = useUserCompany();
  const { hasPermission } = usePermissions();

  // Check if user has reconciliation permission
  const canViewReconciliation = hasPermission('can_view_reconciliation');

  // Get summary data for display (first page only for counts)
  const { data: expensesResult } = useOptimizedExpenses({ 
    page: 1, 
    pageSize: 1, 
    enabled: canViewReconciliation 
  });
  
  const { data: invoices } = useOptimizedInvoices();

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

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Conciliación de Gastos</h1>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">
            Selecciona un gasto y busca la factura correspondiente
          </CardTitle>
          {userCompany && (
            <div className="space-y-1">
              <p className="text-sm text-gray-500">
                Mostrando datos de: {userCompany.nombre}
              </p>
              <p className="text-xs text-gray-400">
                RFC: {userCompany.rfc} | Facturas disponibles: {invoices?.length || 0}
              </p>
              {invoices && invoices.length > 0 && (
                <p className="text-xs text-gray-400">
                  Facturas de nómina: {invoices.filter(inv => inv.invoice_type === 'N').length}
                </p>
              )}
              {expensesResult && (
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Total gastos sin conciliar: {expensesResult.count || 0}</p>
                  <p className="text-green-600 font-medium">
                    ⚡ Optimizado con paginación para mejor rendimiento
                  </p>
                </div>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ReconciliationTable />
        </CardContent>
      </Card>
    </div>
  );
};

export default Reconciliation;
