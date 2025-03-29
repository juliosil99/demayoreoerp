
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
      // Get expenses that aren't reconciled yet
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          bank_accounts (name),
          chart_of_accounts (name, code),
          contacts (name)
        `)
        .eq("user_id", user!.id)
        .is("reconciled", null)
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: invoices } = useQuery({
    queryKey: ["unreconciled-invoices"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("invoices")
        .select("*, paid_amount")
        .is("processed", false)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
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
