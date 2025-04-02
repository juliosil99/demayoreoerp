
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ContactFormValues } from "../types";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartAccount {
  id: string;
  code: string;
  name: string;
  account_type: string;
}

interface DefaultChartAccountFieldProps {
  form: UseFormReturn<ContactFormValues>;
  visible: boolean;
}

export const DefaultChartAccountField = ({ form, visible }: DefaultChartAccountFieldProps) => {
  const { data: chartAccounts = [], isLoading } = useQuery<ChartAccount[]>({
    queryKey: ["chartAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chart_of_accounts")
        .select("*")
        .in("account_type", ["expense", "asset", "liability"])
        .order('code');
      
      if (error) throw error;
      return data;
    },
    enabled: visible,
  });

  // Group accounts by type
  const groupedAccounts = chartAccounts.reduce((acc, account) => {
    if (!acc[account.account_type]) {
      acc[account.account_type] = [];
    }
    acc[account.account_type].push(account);
    return acc;
  }, {} as Record<string, typeof chartAccounts>);

  // Translate account types
  const accountTypeLabels: Record<string, string> = {
    asset: "Activos",
    liability: "Pasivos",
    expense: "Gastos"
  };

  if (!visible) return null;

  if (isLoading) {
    return (
      <FormItem>
        <FormLabel>Cuenta Contable Predeterminada</FormLabel>
        <Skeleton className="h-10 w-full" />
      </FormItem>
    );
  }

  return (
    <FormField
      control={form.control}
      name="default_chart_account_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cuenta Contable Predeterminada</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || ""}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta contable predeterminada" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="">Ninguna</SelectItem>
              {Object.entries(groupedAccounts).map(([type, accounts]) => (
                <SelectGroup key={type}>
                  <SelectLabel>{accountTypeLabels[type] || type}</SelectLabel>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.code} - {account.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
