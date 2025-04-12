
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { UseFormReturn } from "react-hook-form";
import { ItemFormValues } from "./types";

interface RecurringToggleProps {
  form: UseFormReturn<ItemFormValues>;
}

export function RecurringToggle({ form }: RecurringToggleProps) {
  return (
    <FormField
      control={form.control}
      name="is_recurring"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Recurrente</FormLabel>
          <div className="flex items-center space-x-2 h-10">
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
            <span className="text-sm text-muted-foreground">
              {field.value ? 'Sí' : 'No'}
            </span>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
