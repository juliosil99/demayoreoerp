
import React, { useEffect } from "react";
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
import { useChartAccountsQuery } from "../../hooks/usePayableQueries";
import { PayableFormData } from "../../types/payableTypes";
import { Skeleton } from "@/components/ui/skeleton";

interface ChartAccountFieldProps {
  form: UseFormReturn<PayableFormData>;
}

export function ChartAccountField({ form }: ChartAccountFieldProps) {
  const { data: chartAccounts, isLoading } = useChartAccountsQuery();
  
  // Log the current chart account value whenever it changes
  const chartAccountId = form.watch("chart_account_id");
  
  useEffect(() => {
    console.log("[ChartAccountField] Current chart_account_id:", chartAccountId);
  }, [chartAccountId]);
  
  // Group accounts by type
  const groupedAccounts = React.useMemo(() => {
    if (!chartAccounts) return {};
    
    console.log("[ChartAccountField] Available chart accounts:", chartAccounts);
    
    return chartAccounts.reduce((acc, account) => {
      // Extract account_type from the account name or code if available
      // This is a simplification - ideally the API would return account_type
      let accountType = "expense";
      
      if (!acc[accountType]) {
        acc[accountType] = [];
      }
      acc[accountType].push(account);
      return acc;
    }, {} as Record<string, typeof chartAccounts>);
  }, [chartAccounts]);
  
  // Translate account types
  const accountTypeLabels: Record<string, string> = {
    asset: "Activos",
    liability: "Pasivos",
    expense: "Gastos"
  };

  if (isLoading) {
    return (
      <FormItem>
        <FormLabel>Cuenta Contable</FormLabel>
        <Skeleton className="h-10 w-full" />
      </FormItem>
    );
  }

  const handleChartAccountChange = (value: string) => {
    console.log("[ChartAccountField] Chart account selected manually:", value);
    
    // If selecting "none", set to null, otherwise use the selected value
    const newValue = value === "none" ? null : value;
    form.setValue("chart_account_id", newValue, {
      shouldValidate: true
    });
  };

  // Find the currently selected account to display its name
  const findAccountName = () => {
    if (!chartAccountId || chartAccountId === "none") return "Ninguna";
    
    for (const accountType in groupedAccounts) {
      const account = groupedAccounts[accountType]?.find(a => a.id === chartAccountId);
      if (account) {
        return `${account.code} - ${account.name}`;
      }
    }
    
    return "Cuenta seleccionada";
  };

  return (
    <FormField
      control={form.control}
      name="chart_account_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cuenta Contable</FormLabel>
          <Select 
            onValueChange={handleChartAccountChange} 
            value={field.value || "none"}
            defaultValue={field.value || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta contable">
                  {field.value ? findAccountName() : "Seleccionar cuenta contable"}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Ninguna</SelectItem>
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
}
