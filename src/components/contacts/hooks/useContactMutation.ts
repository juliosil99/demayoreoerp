
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Contact, ContactFormValues } from "../types";

interface UseContactMutationProps {
  onSuccess: () => void;
  contactToEdit?: Contact;
}

export const useContactMutation = ({ onSuccess, contactToEdit }: UseContactMutationProps) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ContactFormValues & { user_id: string }) => {
      if (contactToEdit) {
        const { data, error } = await supabase
          .from("contacts")
          .update(values)
          .eq("id", contactToEdit.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("contacts")
          .insert([values])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      onSuccess();
      toast.success(
        contactToEdit ? "Contact updated successfully" : "Contact created successfully"
      );
    },
    onError: (error) => {
      console.error("Error saving contact:", error);
      toast.error(
        contactToEdit ? "Failed to update contact" : "Failed to create contact"
      );
    },
  });
};

