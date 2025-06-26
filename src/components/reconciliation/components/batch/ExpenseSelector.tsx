
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plus } from "lucide-react";
import { formatCurrency, formatCardDate } from "@/utils/formatters";

interface ExpenseSelectorProps {
  onAddItem: (item: any) => void;
  selectedItems: any[];
}

export function ExpenseSelector({ onAddItem, selectedItems }: ExpenseSelectorProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["batch-expenses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          contacts (name),
          bank_accounts (name, currency),
          chart_of_accounts (name, code)
        `)
        .eq("user_id", user.id)
        .or("reconciled.is.null,reconciled.eq.false")
        .is("reconciliation_batch_id", null)
        .order("date", { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const filteredExpenses = expenses?.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.contacts?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const isSelected = (expenseId: string) => {
    return selectedItems.some(item => item.id === expenseId && item.type === 'expense');
  };

  const handleAddExpense = (expense: any) => {
    const item = {
      id: expense.id,
      type: 'expense' as const,
      description: expense.description,
      amount: -expense.amount, // Negativo porque es un gasto
      currency: expense.currency,
      date: expense.date,
      supplier: expense.contacts?.name
    };
    onAddItem(item);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Cargando gastos...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar gastos por descripción o proveedor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Lista de gastos */}
      <ScrollArea className="h-80">
        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No se encontraron gastos disponibles
            </div>
          ) : (
            filteredExpenses.map((expense) => {
              const selected = isSelected(expense.id);
              return (
                <Card key={expense.id} className={`cursor-pointer transition-colors ${selected ? 'bg-muted' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-sm">{expense.description}</h4>
                          {expense.currency !== 'MXN' && (
                            <Badge variant="outline" className="text-xs">
                              {expense.currency}
                            </Badge>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div>Fecha: {formatCardDate(expense.date)}</div>
                          <div>Cuenta: {expense.bank_accounts?.name}</div>
                          {expense.contacts?.name && (
                            <div>Proveedor: {expense.contacts.name}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm mb-2">
                          {formatCurrency(expense.amount)} {expense.currency}
                        </div>
                        <Button
                          size="sm"
                          variant={selected ? "secondary" : "default"}
                          onClick={() => handleAddExpense(expense)}
                          disabled={selected}
                        >
                          {selected ? "Agregado" : <><Plus className="h-3 w-3 mr-1" />Agregar</>}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
