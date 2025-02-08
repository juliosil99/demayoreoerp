
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rfc: z.string().min(12, "RFC must be at least 12 characters"),
  phone: z.string().optional(),
  type: z.enum(["client", "supplier"]),
  tax_regime: z.string().min(1, "Tax regime is required"),
  postal_code: z.string().min(5, "Postal code must be 5 digits"),
  address: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface Contact {
  id: string;
  name: string;
  rfc: string;
  phone?: string;
  type: "client" | "supplier";
  tax_regime: string;
  postal_code: string;
  address?: string;
}

interface ContactFormProps {
  onSuccess: () => void;
  contactToEdit?: Contact;
}

export default function ContactForm({ onSuccess, contactToEdit }: ContactFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const defaultValues: ContactFormValues = contactToEdit || {
    name: "",
    rfc: "",
    phone: "",
    type: "client",
    tax_regime: "",
    postal_code: "",
    address: "",
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues,
  });

  const createContact = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      if (!user?.id) throw new Error("User not authenticated");

      const contactData = {
        ...values,
        user_id: user.id,
      };

      if (contactToEdit) {
        const { data, error } = await supabase
          .from("contacts")
          .update(contactData)
          .eq("id", contactToEdit.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("contacts")
          .insert([contactData])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      form.reset();
      onSuccess();
      toast.success(contactToEdit ? "Contact updated successfully" : "Contact created successfully");
    },
    onError: (error) => {
      console.error("Error saving contact:", error);
      toast.error(contactToEdit ? "Failed to update contact" : "Failed to create contact");
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    createContact.mutate(values);
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rfc"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RFC</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tax_regime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Regime</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit">
            {contactToEdit ? "Update Contact" : "Create Contact"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
