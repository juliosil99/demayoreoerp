
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
      const { data: relations, error: relationsError } = await supabase
        .from("expense_invoice_relations")
        .select("expense_id");

      if (relationsError) throw relationsError;

      const reconciledExpenseIds = relations?.map(r => r.expense_id) || [];

      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          bank_accounts (name),
          chart_of_accounts (name, code),
          contacts (name)
        `)
        .eq("user_id", user!.id)
        .not("id", "in", `(${reconciledExpenseIds.join(",")})`)
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
        .select("*")
        .is("processed", false)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Conciliación de Gastos</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Selecciona un gasto y busca la factura correspondiente</CardTitle>
        </CardHeader>
        <CardContent>
          <ReconciliationTable expenses={expenses || []} invoices={invoices || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Reconciliation;
