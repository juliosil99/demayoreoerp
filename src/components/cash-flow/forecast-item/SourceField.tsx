
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ItemFormValues } from "./types";

interface SourceFieldProps {
  form: UseFormReturn<ItemFormValues>;
}

export function SourceField({ form }: SourceFieldProps) {
  return (
    <FormField
      control={form.control}
      name="source"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Origen</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el origen" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="historical">Histórico</SelectItem>
              <SelectItem value="ai_predicted">Predicción IA</SelectItem>
              <SelectItem value="recurring">Recurrente</SelectItem>
              <SelectItem value="reconciled">Reconciliado</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
