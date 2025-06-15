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
  DialogDescription,
} from "@/components/ui/dialog";
import { PlusIcon, ImportIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Database } from "@/integrations/supabase/types/base";
import type { Expense } from "@/components/expenses/components/types";

type DatabaseExpense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string; currency: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string; type?: string } | null;
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
  } | null;
};

type Filters = {
  supplier_id?: string;
  account_id?: number;
  currency?: string;
  unreconciled?: boolean;
  from_payable?: boolean;
};

// Convert database expense to component expense
const mapDatabaseExpenseToExpense = (dbExpense: DatabaseExpense): Expense => {
  return {
    ...dbExpense,
    // Explicitly map any fields that need special handling
    accounts_payable: dbExpense.accounts_payable || null,
    contacts: dbExpense.contacts || null
  };
};

export default function Expenses() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<Filters>({});
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const { data: dbExpenses, isLoading, refetch } = useQuery({
    queryKey: ["expenses", user?.id, filters],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select(`
          *,
          bank_accounts (name, currency),
          chart_of_accounts (name, code),
          contacts (name, type),
          expense_invoice_relations (
            invoice:invoices (uuid, invoice_number, file_path, filename, content_type)
          ),
          accounts_payable!expense_id (
            id,
            client:contacts!client_id (name)
          )
        `)
        .eq('user_id', user!.id);

      if (filters.supplier_id && filters.supplier_id !== "all") {
        query = query.eq('supplier_id', filters.supplier_id);
      }
      
      if (filters.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      
      if (filters.currency) {
        query = query.eq('currency', filters.currency);
      }
      
      if (filters.unreconciled) {
        query = query.is('expense_invoice_relations', null);
        query = query.or('reconciled.is.null,reconciled.eq.false');
      }
      
      if (filters.from_payable) {
        query = query.not('accounts_payable', 'is', null);
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching expenses:", error);
        throw error;
      }
      
      return data as unknown as DatabaseExpense[];
    },
    enabled: !!user,
  });

  // Map database expenses to component expenses
  const expenses: Expense[] = (dbExpenses || []).map(mapDatabaseExpenseToExpense);

  const handleSuccess = useCallback(() => {
    refetch();
    setOpen(false);
  }, [refetch]);

  const handleDialogOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <div className="container mx-auto py-4 md:py-6 px-2 md:px-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Gastos</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <ExpenseImporter onSuccess={refetch}>
            <Button variant="default" className="bg-black text-white hover:bg-gray-800 w-full sm:w-auto">
              <ImportIcon className="w-4 h-4 mr-2" />
              <span className="whitespace-nowrap">Importar Gastos</span>
            </Button>
          </ExpenseImporter>

          <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button variant="default" className="bg-white text-black border border-gray-300 hover:bg-gray-100 w-full sm:w-auto">
                <PlusIcon className="w-4 h-4 mr-2" />
                <span className="whitespace-nowrap">Agregar Gasto</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
                <DialogDescription>
                  Completa los detalles para agregar un nuevo gasto al sistema.
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm 
                onSuccess={handleSuccess} 
                onClose={() => {
                  setOpen(false);
                }} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-2 md:p-4 bg-white rounded-md overflow-x-auto">
          <ExpenseFilters filters={filters} onFiltersChange={setFilters} />
        </div>
        
        <ExpenseList expenses={expenses} isLoading={isLoading} />
      </div>
    </div>
  );
}
