
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
import { PlusIcon, ImportIcon } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
  accounts_payable?: {
    id: string;
    client: {
      name: string;
    };
  };
};

type Filters = {
  supplier_id?: string;
  account_id?: number;
  unreconciled?: boolean;
  from_payable?: boolean;
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
            invoice:invoices (uuid, invoice_number, file_path, filename, content_type)
          ),
          accounts_payable!expense_id (
            id,
            client:contacts!client_id (name)
          )
        `)
        .eq('user_id', user!.id);

      // Add supplier filter
      if (filters.supplier_id && filters.supplier_id !== "all") {
        console.log("Applying supplier filter with ID:", filters.supplier_id);
        query = query.eq('supplier_id', filters.supplier_id);
      }
      
      // Add account filter
      if (filters.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      
      if (filters.unreconciled) {
        // Modified filter logic: 
        // We want expenses that BOTH:
        // 1. Have no expense_invoice_relations
        // 2. AND are either not reconciled or have reconciled set to false
        query = query.is('expense_invoice_relations', null);
        query = query.or('reconciled.is.null,reconciled.eq.false');
      }
      
      if (filters.from_payable) {
        // Filter for expenses that are associated with payables
        query = query.not('accounts_payable', 'is', null);
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
      
      return data as unknown as Expense[];
    },
    enabled: !!user,
  });

  const handleSuccess = useCallback(() => {
    refetch();
    setOpen(false);
  }, [refetch]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gastos</h1>
        <div className="flex gap-2">
          <ExpenseImporter onSuccess={refetch}>
            <Button variant="default" className="bg-black text-white hover:bg-gray-800">
              <ImportIcon className="w-4 h-4 mr-2" />
              Importar Gastos
            </Button>
          </ExpenseImporter>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-white text-black border border-gray-300 hover:bg-gray-100">
                <PlusIcon className="w-4 h-4 mr-2" />
                Agregar Gasto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
              </DialogHeader>
              <ExpenseForm 
                onSuccess={handleSuccess} 
                onClose={() => setOpen(false)} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-white rounded-md">
          <ExpenseFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        
        <ExpenseList expenses={expenses || []} isLoading={isLoading} />
      </div>
    </div>
  );
}
