
import { format } from "date-fns";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExpenseCardProps {
  expense: any;
  onSelectExpense: (expense: any) => void;
}

export function ExpenseCard({ expense, onSelectExpense }: ExpenseCardProps) {
  return (
    <Card
      key={expense.id}
      className="cursor-pointer hover:bg-gray-50 transition-colors"
      onClick={() => onSelectExpense(expense)}
    >
      <CardContent className="p-3 sm:p-4">
        <div className="grid gap-1">
          <div className="font-medium">
            {format(new Date(expense.date), "dd/MM/yyyy")}
          </div>
          <div className="text-sm sm:text-base">{expense.description}</div>
          <div className="text-sm text-muted-foreground">
            ${expense.amount.toFixed(2)}
          </div>
          <div className="text-sm text-muted-foreground">
            {expense.bank_accounts?.name}
          </div>
          <div className="text-sm text-muted-foreground">
            {expense.contacts?.name || "-"}
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="mt-2 w-full sm:w-auto"
            onClick={(e) => {
              e.stopPropagation();
              onSelectExpense(expense);
            }}
          >
            <Search className="h-4 w-4 mr-2" />
            Buscar Factura
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
