
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ItemFormValues } from "./types";

interface CategoryFieldProps {
  form: UseFormReturn<ItemFormValues>;
}

export function CategoryField({ form }: CategoryFieldProps) {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Categoría</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Ej. Ventas, Nómina, Renta..." />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
