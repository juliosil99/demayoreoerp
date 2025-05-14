
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IssuerPdfConfig } from "@/types/pdf-templates";
import { toast } from "@/components/ui/use-toast";

export const usePdfTemplates = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<IssuerPdfConfig | null>(null);
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["pdf-templates"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("issuer_pdf_configs")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        return data as IssuerPdfConfig[];
      } catch (error) {
        console.error("Error fetching PDF templates:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las plantillas.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (template: Partial<IssuerPdfConfig>) => {
      // Ensure the required fields are there
      if (!template.user_id || !template.issuer_rfc) {
        throw new Error("User ID and Issuer RFC are required");
      }
      
      const { data, error } = await supabase
        .from("issuer_pdf_configs")
        .insert(template) // Pass the single object, not an array
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-templates"] });
      toast({
        title: "Plantilla creada",
        description: "La plantilla se ha creado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la plantilla. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const updateTemplateMutation = useMutation({
    mutationFn: async (template: Partial<IssuerPdfConfig>) => {
      const { id, ...updateData } = template;
      const { data, error } = await supabase
        .from("issuer_pdf_configs")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-templates"] });
      toast({
        title: "Plantilla actualizada",
        description: "La plantilla se ha actualizado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la plantilla. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("issuer_pdf_configs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdf-templates"] });
      toast({
        title: "Plantilla eliminada",
        description: "La plantilla se ha eliminado correctamente.",
      });
    },
    onError: (error) => {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la plantilla. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    },
  });

  const createTemplate = useCallback(
    async (template: Partial<IssuerPdfConfig>) => {
      await createTemplateMutation.mutateAsync(template);
    },
    [createTemplateMutation]
  );

  const updateTemplate = useCallback(
    async (template: Partial<IssuerPdfConfig>) => {
      await updateTemplateMutation.mutateAsync(template);
    },
    [updateTemplateMutation]
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      if (window.confirm("¿Estás seguro de que deseas eliminar esta plantilla?")) {
        await deleteTemplateMutation.mutateAsync(id);
      }
    },
    [deleteTemplateMutation]
  );

  return {
    templates,
    isLoading,
    isEditing,
    currentTemplate,
    setIsEditing,
    setCurrentTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
};
