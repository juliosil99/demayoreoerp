
import { Button } from "@/components/ui/button";
import { Contact } from "../types";

interface ContactSubmitButtonProps {
  isPending: boolean;
  contactToEdit?: Contact;
}

export const ContactSubmitButton = ({ 
  isPending, 
  contactToEdit 
}: ContactSubmitButtonProps) => {
  return (
    <Button 
      type="submit"
      disabled={isPending}
    >
      {isPending 
        ? "Procesando..." 
        : contactToEdit 
          ? "Actualizar Contacto" 
          : "Crear Contacto"
      }
    </Button>
  );
};
