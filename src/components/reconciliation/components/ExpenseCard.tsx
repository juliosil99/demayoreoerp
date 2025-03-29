
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseISO, format } from "date-fns";
import { formatCurrency } from "@/utils/formatters";

interface ExpenseCardProps {
  expense: any;
  onSelectExpense: (expense: any) => void;
}

export function ExpenseCard({ expense, onSelectExpense }: ExpenseCardProps) {
  // Correctly parse and format the date to avoid timezone issues
  const formatExpenseDate = (dateString: string) => {
    try {
      if (!dateString) return "-";
      
      // Parse the ISO date string directly to avoid timezone shifts
      const dateObj = parseISO(dateString);
      return format(dateObj, 'dd/MM/yyyy');
    } catch (error) {
      console.error("Error formatting date:", error, dateString);
      return dateString || '-';
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between">
          <div className="font-semibold">{formatExpenseDate(expense.date)}</div>
          <div className="font-bold text-primary">{formatCurrency(expense.amount)}</div>
        </div>
        <div className="text-sm truncate" title={expense.description}>
          {expense.description}
        </div>
        <div className="text-xs text-muted-foreground">
          <div>Cuenta: {expense.bank_accounts.name}</div>
          <div>Categoría: {expense.chart_of_accounts.name}</div>
          <div>Proveedor: {expense.contacts?.name || "Sin proveedor"}</div>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/40 p-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => onSelectExpense(expense)}
        >
          Conciliar
        </Button>
      </CardFooter>
    </Card>
  );
}
