
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useContactMutation } from "./useContactMutation";
import { Contact, ContactFormValues } from "../types";

interface UseContactFormProps {
  onSuccess: () => void;
  contactToEdit?: Contact;
}

export const useContactForm = ({ onSuccess, contactToEdit }: UseContactFormProps) => {
  const { user } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);

  const createContact = useContactMutation({ 
    onSuccess, 
    contactToEdit 
  });

  const handleSubmit = async (values: ContactFormValues) => {
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

  return {
    formError,
    setFormError,
    createContact,
    handleSubmit,
    isSubmitting: createContact.isPending
  };
};
