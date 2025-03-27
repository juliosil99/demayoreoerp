
import { Contact } from "../types";
import { ContactCard } from "./ContactCard";

interface ContactCardListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export const ContactCardList = ({ contacts, onEdit, onDelete }: ContactCardListProps) => {
  if (!contacts || contacts.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No se encontraron contactos</div>;
  }

  return (
    <div className="grid gap-3">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};
