
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useAuth } from "@/contexts/AuthContext";
import { Contact, ContactFormValues } from "./types";
import { ContactFormFields } from "./components/ContactFormFields";
import { useContactMutation } from "./hooks/useContactMutation";
import { contactSchema } from "./schema";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ContactFormProps {
  onSuccess: () => void;
  contactToEdit?: Contact;
}

export default function ContactForm({ onSuccess, contactToEdit }: ContactFormProps) {
  const { user } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

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

  const createContact = useContactMutation({ 
    onSuccess, 
    contactToEdit 
  });

  const onSubmit = async (values: ContactFormValues) => {
    if (!user?.id) {
      console.error("No user ID available");
      setFormError("No se pudo identificar el usuario actual");
      return;
    }
    
    setFormError(null);
    try {
      console.log("Submitting form with values:", values);
      await createContact.mutateAsync({ ...values, user_id: user.id });
    } catch (error) {
      console.error("Contact form submission error:", error);
      if (error instanceof Error) {
        setFormError(error.message);
      } else {
        setFormError("Error desconocido al guardar el contacto");
      }
    }
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          
          <ContactFormFields form={form} />
          
          <Button 
            type="submit"
            disabled={createContact.isPending}
          >
            {createContact.isPending 
              ? "Procesando..." 
              : contactToEdit 
                ? "Actualizar Contacto" 
                : "Crear Contacto"
            }
          </Button>
        </form>
      </Form>
    </div>
  );
}
