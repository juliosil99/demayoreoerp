
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatCardDate } from "@/utils/formatters";

interface ExpenseCardProps {
  expense: any;
  onSelectExpense: (expense: any) => void;
}

export function ExpenseCard({ expense, onSelectExpense }: ExpenseCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-2">
        <div className="flex justify-between">
          <div className="font-semibold">{formatCardDate(expense.date)}</div>
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
