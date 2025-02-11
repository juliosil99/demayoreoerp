
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

interface PostalCodeFieldProps {
  form: UseFormReturn<CompanyFormData>;
}

export function PostalCodeField({ form }: PostalCodeFieldProps) {
  return (
    <FormField
      control={form.control}
      name="codigo_postal"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Código Postal</FormLabel>
          <FormControl>
            <Input placeholder="Código Postal" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
