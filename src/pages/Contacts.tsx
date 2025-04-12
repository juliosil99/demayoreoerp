
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/contacts/ContactForm";
import ContactList from "@/components/contacts/ContactList";
import { ContactImporter } from "@/components/contacts/ContactImporter";
import { Contact } from "@/components/contacts/types";

export default function Contacts() {
  const [isCreating, setIsCreating] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<Contact | undefined>();

  const handleEdit = (contact: Contact) => {
    setContactToEdit(contact);
    setIsCreating(true);
  };

  const handleSuccess = () => {
    setIsCreating(false);
    setContactToEdit(undefined);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-4 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl sm:text-2xl font-bold">Contactos</h1>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
          <ContactImporter onSuccess={handleSuccess} />
          <Button 
            className="w-full sm:w-auto"
            onClick={() => {
              if (!isCreating) {
                setContactToEdit(undefined);
              }
              setIsCreating(!isCreating);
            }}
          >
            {isCreating ? "Cancelar" : "Agregar Contacto"}
          </Button>
        </div>
      </div>

      {isCreating && (
        <ContactForm 
          onSuccess={handleSuccess}
          contactToEdit={contactToEdit}
        />
      )}

      <ContactList onEdit={handleEdit} />
    </div>
  );
}
