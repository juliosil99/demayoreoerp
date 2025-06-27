
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ExpenseCard } from "./ExpenseCard";

interface ReconciliationExpenseGridProps {
  expenses: any[];
  onExpenseClick: (expense: any) => void;
}

export function ReconciliationExpenseGrid({
  expenses,
  onExpenseClick
}: ReconciliationExpenseGridProps) {
  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No se encontraron gastos para reconciliar</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {expenses.map((expense) => (
        <ExpenseCard
          key={expense.id}
          expense={expense}
          onSelectExpense={onExpenseClick}
        />
      ))}
    </div>
  );
}
