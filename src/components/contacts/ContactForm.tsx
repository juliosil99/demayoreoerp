
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { Contact, ContactFormValues } from "./types";
import { ContactFormFields } from "./components/ContactFormFields";
import { useContactMutation } from "./hooks/useContactMutation";
import { contactSchema } from "./schema";

interface ContactFormProps {
  onSuccess: () => void;
  contactToEdit?: Contact;
}

export default function ContactForm({ onSuccess, contactToEdit }: ContactFormProps) {
  const { user } = useAuth();

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

  const createContact = useContactMutation({ onSuccess, contactToEdit });

  const onSubmit = (values: ContactFormValues) => {
    if (!user?.id) return;
    createContact.mutate({ ...values, user_id: user.id });
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ContactFormFields form={form} />
          <Button type="submit">
            {contactToEdit ? "Update Contact" : "Create Contact"}
          </Button>
        </form>
      </Form>
    </div>
  );
}

