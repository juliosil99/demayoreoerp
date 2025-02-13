
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import type { BaseFieldProps } from "../types";

export function ExpenseTypeField({ formData, setFormData }: BaseFieldProps) {
  const expenseTypes = [
    { value: 'operational', label: 'Gasto Operativo' },
    { value: 'inventory', label: 'Compra de Inventario' },
    { value: 'fixed_asset', label: 'Activo Fijo' },
    { value: 'investment', label: 'Inversión' },
  ];

  return (
    <div className="space-y-2">
      <Label>Tipo de Movimiento</Label>
      <Select
        value={formData.expense_type}
        onValueChange={(value: 'operational' | 'inventory' | 'fixed_asset' | 'investment') => 
          setFormData({ ...formData, expense_type: value })
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecciona el tipo de movimiento" />
        </SelectTrigger>
        <SelectContent>
          {expenseTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
