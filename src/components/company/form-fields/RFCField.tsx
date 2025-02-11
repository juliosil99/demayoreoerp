
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

interface RFCFieldProps {
  form: UseFormReturn<CompanyFormData>;
}

export function RFCField({ form }: RFCFieldProps) {
  return (
    <FormField
      control={form.control}
      name="rfc"
      render={({ field }) => (
        <FormItem>
          <FormLabel>RFC</FormLabel>
          <FormControl>
            <Input placeholder="RFC" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
