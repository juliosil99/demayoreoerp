
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ItemFormValues } from "./types";

interface DescriptionFieldProps {
  form: UseFormReturn<ItemFormValues>;
}

export function DescriptionField({ form }: DescriptionFieldProps) {
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Descripción (Opcional)</FormLabel>
          <FormControl>
            <Textarea 
              {...field} 
              placeholder="Descripción detallada del elemento..." 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
