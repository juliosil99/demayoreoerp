
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { ExpenseImporter } from "@/components/expenses/ExpenseImporter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
    }
  }[];
};

type Filters = {
  supplier_id?: string;
  account_id?: number;
  unreconciled?: boolean;
};

export default function Expenses() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({});
  const [open, setOpen] = useState(false);

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ["expenses", user?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          bank_accounts (name),
          chart_of_accounts (name, code),
          contacts (name),
          expense_invoice_relations (
            invoice:invoices (uuid, invoice_number)
          )
        `)
        .eq('user_id', user!.id);

      if (filters.supplier_id) {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      if (filters.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      if (filters.unreconciled) {
        // Cambiamos la condición para mostrar gastos sin conciliar
        query = query.is('expense_invoice_relations', null);
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!user,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <div className="flex gap-2">
          <ExpenseImporter onSuccess={refetch} />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
              </DialogHeader>
              <ExpenseForm 
                onSuccess={refetch} 
                onClose={() => setOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <ExpenseFilters filters={filters} onFiltersChange={setFilters} />
      <ExpenseList expenses={expenses || []} isLoading={isLoading} />
    </div>
  );
}
