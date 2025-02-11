
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
import { CompanyFormData } from "../types";
import { useTaxRegimes } from "@/hooks/company/useTaxRegimes";

interface TaxRegimeFieldProps {
  form: UseFormReturn<CompanyFormData>;
}

export function TaxRegimeField({ form }: TaxRegimeFieldProps) {
  const { taxRegimes } = useTaxRegimes();
  
  return (
    <FormField
      control={form.control}
      name="regimen_fiscal"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Régimen Fiscal</FormLabel>
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un régimen fiscal" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {taxRegimes.map((regime) => (
                <SelectItem key={regime.key} value={regime.key}>
                  {regime.key} - {regime.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
