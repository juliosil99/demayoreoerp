
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ExpenseFiltersProps {
  filters: {
    supplier_id?: string;
    account_id?: number;
    unreconciled?: boolean;
  };
  onFiltersChange: (filters: {
    supplier_id?: string;
    account_id?: number;
    unreconciled?: boolean;
  }) => void;
}

export function ExpenseFilters({ filters, onFiltersChange }: ExpenseFiltersProps) {
  const { user } = useAuth();

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, name')
        .eq('user_id', user!.id)
        .eq('type', 'supplier');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: bankAccounts } = useQuery({
    queryKey: ["bankAccounts", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('id, name');

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return (
    <div className="flex flex-wrap gap-4 items-end">
      <div className="space-y-2">
        <Label>Proveedor</Label>
        <Select
          value={filters.supplier_id || ""}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, supplier_id: value || undefined })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos los proveedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todos los proveedores</SelectItem>
            {suppliers?.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Cuenta Bancaria</Label>
        <Select
          value={filters.account_id?.toString() || ""}
          onValueChange={(value) =>
            onFiltersChange({ ...filters, account_id: value ? parseInt(value) : undefined })
          }
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas las cuentas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Todas las cuentas</SelectItem>
            {bankAccounts?.map((account) => (
              <SelectItem key={account.id} value={account.id.toString()}>
                {account.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Label>Solo gastos sin conciliar</Label>
        <Switch
          checked={filters.unreconciled || false}
          onCheckedChange={(checked) =>
            onFiltersChange({ ...filters, unreconciled: checked })
          }
        />
      </div>
    </div>
  );
}
