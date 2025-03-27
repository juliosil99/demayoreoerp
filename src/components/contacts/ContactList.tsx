
import { useState } from "react";
import { Contact } from "./types";
import { useContacts } from "./hooks/useContacts";
import { useContactDelete } from "./hooks/useContactDelete";
import { ContactFilters } from "./components/ContactFilters";
import { ContactCardList } from "./components/ContactCardList";

interface ContactListProps {
  onEdit: (contact: Contact) => void;
}

export default function ContactList({ onEdit }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "client" | "supplier" | "employee">("all");
  
  const { data: contacts, isLoading } = useContacts();
  const deleteContact = useContactDelete();

  const handleDelete = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este contacto?")) {
      deleteContact.mutate(id);
    }
  };

  const filteredContacts = contacts?.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contact.rfc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (contact.phone && contact.phone.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesType = typeFilter === "all" || contact.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  if (isLoading) {
    return <div>Cargando contactos...</div>;
  }

  return (
    <div className="space-y-4">
      <ContactFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
      />

      <ContactCardList 
        contacts={filteredContacts || []}
        onEdit={onEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
