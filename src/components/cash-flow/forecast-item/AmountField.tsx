
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ItemFormValues } from "./types";

interface AmountFieldProps {
  form: UseFormReturn<ItemFormValues>;
}

export function AmountField({ form }: AmountFieldProps) {
  return (
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Monto</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              step="0.01" 
              min="0" 
              {...field} 
              placeholder="0.00" 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
