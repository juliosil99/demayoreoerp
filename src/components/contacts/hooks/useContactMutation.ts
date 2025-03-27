
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
      console.log("Attempting to save contact:", values);
      
      try {
        if (contactToEdit) {
          console.log("Updating existing contact with ID:", contactToEdit.id);
          const { data, error } = await supabase
            .from("contacts")
            .update(values)
            .eq("id", contactToEdit.id)
            .select()
            .single();

          if (error) {
            console.error("Error updating contact:", error);
            if (error.code === "23505" && error.message.includes("unique_rfc_per_user")) {
              throw new Error("Ya existe un contacto con este RFC para este usuario.");
            }
            throw error;
          }
          console.log("Contact updated successfully:", data);
          return data;
        } else {
          console.log("Creating new contact");
          // Check if RFC already exists for this user
          const { data: existingContacts, error: checkError } = await supabase
            .from("contacts")
            .select("id")
            .eq("rfc", values.rfc)
            .eq("user_id", values.user_id)
            .limit(1);
            
          if (checkError) {
            console.error("Error checking existing contacts:", checkError);
            throw checkError;
          }
          
          if (existingContacts && existingContacts.length > 0) {
            console.error("Duplicate RFC found:", values.rfc);
            throw new Error("Ya existe un contacto con este RFC para este usuario.");
          }
          
          const { data, error } = await supabase
            .from("contacts")
            .insert([values])
            .select()
            .single();

          if (error) {
            console.error("Error creating contact:", error);
            if (error.code === "23505" && error.message.includes("unique_rfc_per_user")) {
              throw new Error("Ya existe un contacto con este RFC para este usuario.");
            }
            throw error;
          }
          console.log("Contact created successfully:", data);
          return data;
        }
      } catch (error) {
        console.error("Error in contact mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Mutation success callback with data:", data);
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      onSuccess();
      toast.success(
        contactToEdit ? "Contacto actualizado exitosamente" : "Contacto creado exitosamente"
      );
    },
    onError: (error) => {
      console.error("Error saving contact:", error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : contactToEdit ? "No se pudo actualizar el contacto" : "No se pudo crear el contacto";
      
      toast.error(errorMessage);
    },
  });
};
