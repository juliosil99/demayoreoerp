
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconciliationTable } from "@/components/reconciliation/ReconciliationTable";

const Reconciliation = () => {
  const { user } = useAuth();

  const { data: expenses, refetch: refetchExpenses } = useQuery({
    queryKey: ["unreconciled-expenses", user?.id],
    queryFn: async () => {
      console.log("Fetching unreconciled expenses...");
      
      if (!user?.id) {
        console.log("No user ID, skipping fetch");
        return [];
      }
      
      // Debug: Check some reconciled expenses
      const { data: reconciled, error: reconciledError } = await supabase
        .from("expenses")
        .select("id, reconciled, reconciliation_date, reconciliation_type")
        .eq("user_id", user.id)
        .is("reconciled", true)
        .limit(3);
        
      if (reconciled?.length) {
        console.log("Sample reconciled expenses:", reconciled);
      } else {
        console.log("No reconciled expenses found for debugging");
      }
      
      // Query for unreconciled expenses - use explicit FALSE or NULL check
      console.log("Querying for unreconciled expenses...");
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          bank_accounts (name),
          chart_of_accounts (name, code),
          contacts (name)
        `)
        .eq("user_id", user.id)
        .or("reconciled.is.null,reconciled.eq.false"); // Check for both NULL and FALSE

      if (error) {
        console.error("Error fetching unreconciled expenses:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} unreconciled expenses`);
      return data;
    },
    enabled: !!user?.id,
    refetchOnWindowFocus: true, // Refresh data when window regains focus
  });

  const { data: invoices } = useQuery({
    queryKey: ["unreconciled-invoices", user?.id],
    queryFn: async () => {
      console.log("Fetching unreconciled invoices...");
      
      if (!user?.id) {
        console.log("No user ID, skipping fetch");
        return [];
      }
      
      const { data, error } = await supabase
        .from("invoices")
        .select("*, paid_amount")
        .is("processed", false)
        .order("invoice_date", { ascending: false });

      if (error) {
        console.error("Error fetching unreconciled invoices:", error);
        throw error;
      }
      console.log(`Fetched ${data?.length || 0} unreconciled invoices`);
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <div className="p-2 sm:p-6 space-y-4 sm:space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold">Conciliación de Gastos</h1>
      
      <Card className="shadow-sm">
        <CardHeader className="pb-2 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">
            Selecciona un gasto y busca la factura correspondiente
          </CardTitle>
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
