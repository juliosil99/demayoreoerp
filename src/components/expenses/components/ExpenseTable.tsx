
import {
  Table,
  TableBody,
} from "@/components/ui/table";
import { ExpenseRow } from "./ExpenseRow";
import { ExpenseTableHeader } from "./ExpenseTableHeader";
import { useIsMobile } from "@/hooks/use-mobile";
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
};

interface ExpenseTableProps {
  expenses: Expense[];
  onDelete: (expense: Expense) => Promise<{ success: boolean; log: string[] } | void>;
  onEdit: (expense: Expense) => void;
}

export function ExpenseTable({ 
  expenses,
  onDelete,
  onEdit,
}: ExpenseTableProps) {
  const isMobile = useIsMobile();

  return (
    <div className="overflow-x-auto">
      <div className={`rounded-md ${isMobile ? "min-w-[800px]" : ""}`}>
        <Table>
          <ExpenseTableHeader />
          <TableBody>
            {expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
