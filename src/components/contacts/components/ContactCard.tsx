
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Contact } from "../types";

interface ContactCardProps {
  contact: Contact;
  onEdit: (contact: Contact) => void;
  onDelete: (id: string) => void;
}

export const ContactCard = ({ contact, onEdit, onDelete }: ContactCardProps) => {
  const getContactTypeLabel = (type: string) => {
    switch (type) {
      case 'client':
        return 'Cliente';
      case 'supplier':
        return 'Proveedor';
      case 'employee':
        return 'Empleado';
      default:
        return type;
    }
  };

  return (
    <div className="bg-card border border-border hover:border-primary/20 transition-colors p-3 sm:p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
      <div className="flex-1 min-w-0 text-left">
        <h3 className="font-semibold text-base truncate">{contact.name}</h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="truncate">
            {getContactTypeLabel(contact.type)} • {contact.rfc}
          </span>
          {contact.phone && (
            <>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">Tel: {contact.phone}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0 w-full sm:w-auto justify-end">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(contact)}
          title="Editar contacto"
          className="hover:bg-primary/10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(contact.id)}
          title="Eliminar contacto"
          className="hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
