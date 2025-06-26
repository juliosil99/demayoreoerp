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
      // Now includes both positive expenses and negative amounts (reimbursements/refunds)
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
      
      console.log('📊 Unreconciled expenses found:', data?.length || 0);
      
      // Log reimbursements/refunds specifically
      const reimbursements = data?.filter(expense => expense.amount < 0) || [];
      if (reimbursements.length > 0) {
        console.log('💰 Reimbursements/refunds found:', reimbursements.length);
        console.log('💰 Reimbursement details:', reimbursements.map(r => ({
          id: r.id,
          description: r.description,
          amount: r.amount,
          date: r.date
        })));
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
      console.log("🔍 Reconciliation Debug - Company RFC:", companyRfc);
      
      // Enhanced query to capture both received and issued invoices
      const { data: allInvoices, error } = await supabase
        .from("invoices")
        .select("*, paid_amount")
        .or(`issuer_rfc.eq.${companyRfc},receiver_rfc.eq.${companyRfc}`)
        .order("invoice_date", { ascending: false });

      if (error) {
        console.error("❌ Error fetching invoices:", error);
        throw error;
      }

      console.log("📊 Total invoices found:", allInvoices?.length || 0);
      
      // Separate invoices by type for better debugging
      const issuedInvoices = allInvoices?.filter(inv => inv.issuer_rfc === companyRfc) || [];
      const receivedInvoices = allInvoices?.filter(inv => inv.receiver_rfc === companyRfc) || [];
      const payrollInvoices = issuedInvoices.filter(inv => inv.invoice_type === 'N');
      
      console.log("📤 Issued invoices (by company):", issuedInvoices.length);
      console.log("📥 Received invoices (to company):", receivedInvoices.length); 
      console.log("👥 Payroll invoices (type N):", payrollInvoices.length);
      
      // Log payroll invoice details for debugging
      if (payrollInvoices.length > 0) {
        console.log("👥 Payroll invoices details:", payrollInvoices.map(inv => ({
          id: inv.id,
          invoice_number: inv.invoice_number,
          processed: inv.processed,
          total_amount: inv.total_amount,
          invoice_date: inv.invoice_date,
          receiver_name: inv.receiver_name
        })));
      }

      // Filter logic: Include unprocessed invoices AND processed payroll invoices
      const filteredInvoices = allInvoices?.filter(invoice => {
        // For payroll invoices (type N), include both processed and unprocessed
        if (invoice.invoice_type === 'N' && invoice.issuer_rfc === companyRfc) {
          console.log(`✅ Including payroll invoice ${invoice.invoice_number} (processed: ${invoice.processed})`);
          return true;
        }
        
        // For other invoices, only include unprocessed ones
        const shouldInclude = !invoice.processed;
        if (shouldInclude) {
          console.log(`✅ Including invoice ${invoice.invoice_number} (not processed)`);
        }
        return shouldInclude;
      }) || [];

      console.log("🎯 Final filtered invoices:", filteredInvoices.length);
      console.log("🎯 Payroll invoices in final list:", filteredInvoices.filter(inv => inv.invoice_type === 'N').length);
      
      return filteredInvoices;
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
              {expenses && (
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Gastos sin conciliar: {expenses.filter(e => e.amount > 0).length}</p>
                  <p>Reembolsos sin conciliar: {expenses.filter(e => e.amount < 0).length}</p>
                </div>
              )}
            </div>
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
