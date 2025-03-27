
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Contact, ContactFormValues } from "./types";
import { ContactFormFields } from "./components/ContactFormFields";
import { contactSchema } from "./schema";
import { useContactForm } from "./hooks/useContactForm";
import { ContactFormError } from "./components/ContactFormError";
import { ContactSubmitButton } from "./components/ContactSubmitButton";

interface ContactFormProps {
  onSuccess: () => void;
  contactToEdit?: Contact;
}

export default function ContactForm({ onSuccess, contactToEdit }: ContactFormProps) {
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

  const { 
    formError, 
    handleSubmit, 
    isSubmitting 
  } = useContactForm({ 
    onSuccess, 
    contactToEdit 
  });

  const onSubmit = async (values: ContactFormValues) => {
    await handleSubmit(values);
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <ContactFormError error={formError} />
          <ContactFormFields form={form} />
          <ContactSubmitButton 
            isPending={isSubmitting} 
            contactToEdit={contactToEdit} 
          />
        </form>
      </Form>
    </div>
  );
}
