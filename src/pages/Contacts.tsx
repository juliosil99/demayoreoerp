
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/contacts/ContactForm";
import ContactList from "@/components/contacts/ContactList";
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
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <Button onClick={() => {
          if (!isCreating) {
            setContactToEdit(undefined);
          }
          setIsCreating(!isCreating);
        }}>
          {isCreating ? "Cancelar" : "Agregar Contacto"}
        </Button>
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
