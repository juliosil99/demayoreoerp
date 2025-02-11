
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Contact } from "./types";

interface ContactListProps {
  onEdit: (contact: Contact) => void;
}

export default function ContactList({ onEdit }: ContactListProps) {
  const queryClient = useQueryClient();

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
      // First check if the contact is referenced in expenses
      const { data: expenses, error: checkExpensesError } = await supabase
        .from("expenses")
        .select("id")
        .eq("supplier_id", id)
        .limit(1);

      if (checkExpensesError) throw checkExpensesError;

      if (expenses && expenses.length > 0) {
        throw new Error("Este contacto no puede ser eliminado porque está referenciado en gastos.");
      }

      // Check if the contact is referenced in payments
      const { data: payments, error: checkPaymentsError } = await supabase
        .from("payments")
        .select("id")
        .eq("client_id", id)
        .limit(1);

      if (checkPaymentsError) throw checkPaymentsError;

      if (payments && payments.length > 0) {
        throw new Error("Este contacto no puede ser eliminado porque está referenciado en pagos.");
      }

      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
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

  if (isLoading) {
    return <div>Cargando contactos...</div>;
  }

  return (
    <div className="grid gap-3">
      {contacts?.map((contact) => (
        <div
          key={contact.id}
          className="bg-card border border-border hover:border-primary/20 transition-colors p-4 rounded-lg shadow-sm flex justify-between items-center gap-4"
        >
          <div className="flex-1 min-w-0 text-left">
            <h3 className="font-semibold text-base truncate">{contact.name}</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-muted-foreground">
              <span>
                {contact.type === 'client' ? 'Cliente' : 'Proveedor'} • {contact.rfc}
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
  );
}
