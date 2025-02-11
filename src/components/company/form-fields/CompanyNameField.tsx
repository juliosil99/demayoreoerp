
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { CompanyFormData } from "../types";

interface CompanyNameFieldProps {
  form: UseFormReturn<CompanyFormData>;
}

export function CompanyNameField({ form }: CompanyNameFieldProps) {
  return (
    <FormField
      control={form.control}
      name="nombre"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Nombre de la Empresa</FormLabel>
          <FormControl>
            <Input placeholder="Nombre de la empresa" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
