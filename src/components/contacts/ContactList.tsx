import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { Contact } from "./types";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface ContactListProps {
  onEdit: (contact: Contact) => void;
}

export default function ContactList({ onEdit }: ContactListProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "client" | "supplier" | "employee">("all");

  const { data: contacts, isLoading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Contact[];
    },
  });

  const deleteContact = useMutation({
    mutationFn: async (id: string) => {
      try {
        // Check expenses references
        const { data: expenses, error: expensesError } = await supabase
          .from("expenses")
          .select("id")
          .eq("supplier_id", id)
          .limit(1);
        
        if (expensesError) throw expensesError;
        if (expenses?.length > 0) {
          throw new Error("Este contacto no puede ser eliminado porque está referenciado en gastos.");
        }

        // Check client payments references
        const { data: clientPayments, error: clientError } = await supabase
          .from("payments")
          .select("id")
          .eq("client_id", id)
          .limit(1);
        
        if (clientError) throw clientError;
        if (clientPayments?.length > 0) {
          throw new Error("Este contacto no puede ser eliminado porque está referenciado en pagos como cliente.");
        }

        // Delete the contact
        const { error: deleteError } = await supabase
          .from("contacts")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("Error al eliminar el contacto");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contacto eliminado exitosamente");
    },
    onError: (error) => {
      console.error("Error al eliminar contacto:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error al eliminar contacto");
      }
    },
  });

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, RFC o teléfono..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={typeFilter}
            onValueChange={(value: "all" | "client" | "supplier" | "employee") => setTypeFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="client">Clientes</SelectItem>
              <SelectItem value="supplier">Proveedores</SelectItem>
              <SelectItem value="employee">Empleados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3">
        {filteredContacts?.map((contact) => (
          <div
            key={contact.id}
            className="bg-card border border-border hover:border-primary/20 transition-colors p-4 rounded-lg shadow-sm flex justify-between items-center gap-4"
          >
            <div className="flex-1 min-w-0 text-left">
              <h3 className="font-semibold text-base truncate">{contact.name}</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
                <span>
                  {getContactTypeLabel(contact.type)} • {contact.rfc}
                </span>
                {contact.phone && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <span>Tel: {contact.phone}</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
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
                onClick={() => handleDelete(contact.id)}
                title="Eliminar contacto"
                className="hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
