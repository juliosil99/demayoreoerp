
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconciliationTable } from "@/components/reconciliation/ReconciliationTable";

const Reconciliation = () => {
  const { user } = useAuth();

  const { data: expenses } = useQuery({
    queryKey: ["unreconciled-expenses", user?.id],
    queryFn: async () => {
      console.log("Fetching unreconciled expenses...");
      
      // Check if we can retrieve some reconciled expenses to debug
      const { data: reconciled, error: reconciledError } = await supabase
        .from("expenses")
        .select("id, reconciled, reconciliation_date, reconciliation_type")
        .eq("user_id", user!.id)
        .is("reconciled", true)
        .limit(3);
        
      if (reconciled?.length) {
        console.log("Sample reconciled expenses:", reconciled);
      }
      
      // Get expenses that aren't reconciled yet 
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          bank_accounts (name),
          chart_of_accounts (name, code),
          contacts (name),
          expense_invoice_relations!left (id),
          manual_reconciliations!left (id)
        `)
        .eq("user_id", user!.id)
        .is("expense_invoice_relations.id", null)
        .is("manual_reconciliations.id", null)
        .or('reconciled.is.null,reconciled.eq.false')
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching unreconciled expenses:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} unreconciled expenses`);
      return data;
    },
    enabled: !!user,
  });

  const { data: invoices } = useQuery({
    queryKey: ["unreconciled-invoices"],
    queryFn: async () => {
      console.log("Fetching unreconciled invoices...");
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
          <ReconciliationTable expenses={expenses || []} invoices={invoices || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Reconciliation;
