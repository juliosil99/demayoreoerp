
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
import { useClientQuery } from "../../hooks/usePayableQueries";
import { PayableFormData } from "../../types/payableTypes";

interface ClientFieldProps {
  form: UseFormReturn<PayableFormData>;
}

export function ClientField({ form }: ClientFieldProps) {
  const { data: clients, isLoading } = useClientQuery();

  const handleClientChange = (value: string) => {
    console.log("[ClientField] Client selected:", value);
    const client = clients?.find(c => c.id === value);
    console.log("[ClientField] Selected client details:", client);
    
    // Set the client ID first
    form.setValue("client_id", value, { 
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true
    });
    
    // Clear the invoice_id since it's related to the client
    form.setValue("invoice_id", null);
  };

  return (
    <FormField
      control={form.control}
      name="client_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Proveedor</FormLabel>
          <Select 
            onValueChange={handleClientChange} 
            value={field.value}
            disabled={isLoading}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar proveedor" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {clients?.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.rfc}
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
