import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function Contacts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      rfc: "",
      phone: "",
      type: "client",
      tax_regime: "",
      postal_code: "",
      address: "",
    },
  });

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const createContact = useMutation({
    mutationFn: async (values: ContactFormValues) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const contactData = {
        ...values,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from("contacts")
        .insert([contactData]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      setIsCreating(false);
      form.reset();
      toast.success("Contact created successfully");
    },
    onError: (error) => {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact");
    },
  });

  const onSubmit = (values: ContactFormValues) => {
    createContact.mutate(values);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancel" : "Add Contact"}
        </Button>
      </div>

      {isCreating && (
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit">Create Contact</Button>
            </form>
          </Form>
        </div>
      )}

      {isLoading ? (
        <div>Loading contacts...</div>
      ) : (
        <div className="grid gap-4">
          {contacts?.map((contact) => (
            <div
              key={contact.id}
              className="bg-card p-4 rounded-lg shadow flex justify-between items-center"
            >
              <div>
                <h3 className="font-semibold">{contact.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)} •{" "}
                  {contact.rfc}
                </p>
                {contact.phone && (
                  <p className="text-sm text-muted-foreground">
                    Phone: {contact.phone}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}