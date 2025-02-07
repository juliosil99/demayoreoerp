
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ContactForm from "@/components/contacts/ContactForm";
import ContactList from "@/components/contacts/ContactList";

export default function Contacts() {
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Contactos</h1>
        <Button onClick={() => setIsCreating(!isCreating)}>
          {isCreating ? "Cancelar" : "Agregar Contacto"}
        </Button>
      </div>

      {isCreating && (
        <ContactForm onSuccess={() => setIsCreating(false)} />
      )}

      <ContactList />
    </div>
  );
}
