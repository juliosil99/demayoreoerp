
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function AddressField({ form }: { form: any }) {
  return (
    <FormField
      control={form.control}
      name="direccion"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Dirección</FormLabel>
          <FormControl>
            <Input placeholder="Calle, número, colonia" {...field} value={field.value || ''} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
