import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Contact {
  id: string;
  name: string;
  rfc: string;
  phone?: string;
  type: string;
  created_at: string;
}

export default function ContactList() {
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
        </div>
      ))}
    </div>
  );
}