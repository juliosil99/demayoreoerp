
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReconciliationTable } from "@/components/reconciliation/ReconciliationTable";

export interface ReconciliationExpense {
  id: string;
  amount: number;
  date: string;
  description: string;
  bank_accounts: {
    name: string;
  };
  chart_of_accounts: {
    name: string;
    code: string;
  };
  contacts?: {
    name: string;
  } | null;
  [key: string]: any;
}

export interface ReconciliationInvoice {
  id: string; // Using string to match what ReconciliationTable expects
  uuid: string;
  invoice_number: string;
  total_amount: number;
  paid_amount?: number;
  invoice_date: string;
  [key: string]: any;
}

const Reconciliation = () => {
  const { user, currentCompany } = useAuth();

  const { data: expenses = [] } = useQuery<ReconciliationExpense[]>({
    queryKey: ["unreconciled-expenses", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
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
        .eq("company_id", currentCompany.id)
        .filter('id', 'not.in', `(${reconciledExpenseIds.join(',') || '00000000-0000-0000-0000-000000000000'})`)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as unknown as ReconciliationExpense[];
    },
    enabled: !!currentCompany?.id,
  });

  const { data: invoices = [] } = useQuery<ReconciliationInvoice[]>({
    queryKey: ["unreconciled-invoices", currentCompany?.id],
    queryFn: async () => {
      if (!currentCompany?.id) return [];
      
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("company_id", currentCompany.id)
        .is("processed", false)
        .order("invoice_date", { ascending: false });

      if (error) throw error;
      
      // Convert each invoice's id from number to string to match ReconciliationInvoice
      return (data || []).map(invoice => ({
        ...invoice,
        id: String(invoice.id)
      })) as ReconciliationInvoice[];
    },
    enabled: !!currentCompany?.id,
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
          <ReconciliationTable expenses={expenses} invoices={invoices} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Reconciliation;
