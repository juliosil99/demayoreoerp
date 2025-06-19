
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCompany } from "@/hooks/useUserCompany";
import { usePermissions } from "@/hooks/usePermissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconciliationTable } from "@/components/reconciliation/ReconciliationTable";

const Reconciliation = () => {
  const { user } = useAuth();
  const { data: userCompany } = useUserCompany();
  const { hasPermission } = usePermissions();

  // Check if user has reconciliation permission
  const canViewReconciliation = hasPermission('can_view_reconciliation');

  const { data: expenses, refetch: refetchExpenses } = useQuery({
    queryKey: ["unreconciled-expenses", userCompany?.id],
    queryFn: async () => {
      if (!userCompany?.id || !canViewReconciliation) {
        return [];
      }
      
      // Get all users from the same company
      const { data: companyUsers, error: companyUsersError } = await supabase
        .from("company_users")
        .select("user_id")
        .eq("company_id", userCompany.id);

      if (companyUsersError) {
        throw companyUsersError;
      }

      // Also include the company owner
      const { data: companyOwner, error: ownerError } = await supabase
        .from("companies")
        .select("user_id")
        .eq("id", userCompany.id)
        .single();

      if (ownerError && ownerError.code !== 'PGRST116') {
        throw ownerError;
      }

      // Combine all user IDs
      const allUserIds = [
        ...companyUsers.map(cu => cu.user_id),
        ...(companyOwner ? [companyOwner.user_id] : [])
      ];

      if (allUserIds.length === 0) {
        return [];
      }
      
      // Query for unreconciled expenses from all company users
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          bank_accounts (name),
          chart_of_accounts (name, code),
          contacts (name),
          accounts_payable!expense_id (
            id,
            invoice_id,
            client:contacts!client_id (name)
          )
        `)
        .in("user_id", allUserIds)
        .or("reconciled.is.null,reconciled.eq.false") // Check for both NULL and FALSE
        .order('date', { ascending: false }); // Order by date, newest first

      if (error) {
        throw error;
      }
      
      return data;
    },
    enabled: !!userCompany?.id && canViewReconciliation,
    refetchOnWindowFocus: true, // Refresh data when window regains focus
  });

  const { data: invoices } = useQuery({
    queryKey: ["unreconciled-invoices", userCompany?.id],
    queryFn: async () => {
      if (!userCompany?.id || !canViewReconciliation) {
        return [];
      }
      
      // Get company RFC to filter invoices
      const companyRfc = userCompany.rfc;
      
      const { data, error } = await supabase
        .from("invoices")
        .select("*, paid_amount")
        .is("processed", false)
        .or(`issuer_rfc.eq.${companyRfc},receiver_rfc.eq.${companyRfc}`)
        .order("invoice_date", { ascending: false });

      if (error) {
        throw error;
      }
      return data;
    },
    enabled: !!userCompany?.id && canViewReconciliation,
  });

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
            <p className="text-sm text-gray-500">
              Mostrando datos de: {userCompany.nombre}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <ReconciliationTable 
            expenses={expenses || []} 
            invoices={invoices || []} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Reconciliation;
