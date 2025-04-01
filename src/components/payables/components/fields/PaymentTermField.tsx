
import React from "react";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { PayableFormData } from "../../types/payableTypes";

interface PaymentTermFieldProps {
  form: UseFormReturn<PayableFormData>;
}

export function PaymentTermField({ form }: PaymentTermFieldProps) {
  return (
    <FormField
      control={form.control}
      name="payment_term"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Plazo de pago (días)</FormLabel>
          <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar plazo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="30">30 días</SelectItem>
              <SelectItem value="60">60 días</SelectItem>
              <SelectItem value="90">90 días</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
