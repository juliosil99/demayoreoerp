
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
      const { data: expenses, error: checkError } = await supabase
        .from("expenses")
        .select("id")
        .eq("supplier_id", id)
        .limit(1);

      if (checkError) throw checkError;

      if (expenses && expenses.length > 0) {
        throw new Error("This contact cannot be deleted because it is referenced in expenses.");
      }

      const { error } = await supabase
        .from("contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contact deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting contact:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to delete contact");
      }
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this contact?")) {
      deleteContact.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="grid gap-4">
      {contacts?.map((contact) => (
        <div
          key={contact.id}
          className="bg-card p-4 rounded-lg shadow flex justify-between items-center"
        >
          <div>
            <h3 className="font-semibold">{contact.name}</h3>
            <p className="text-sm text-muted-foreground">
              {contact.type.charAt(0).toUpperCase() + contact.type.slice(1)} •{" "}
              {contact.rfc}
            </p>
            {contact.phone && (
              <p className="text-sm text-muted-foreground">
                Phone: {contact.phone}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(contact)}
              title="Edit contact"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(contact.id)}
              title="Delete contact"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
