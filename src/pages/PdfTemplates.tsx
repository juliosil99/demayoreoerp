
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PdfTemplatesList } from "@/components/pdf-templates/PdfTemplatesList";
import { PdfTemplateDialog } from "@/components/pdf-templates/PdfTemplateDialog";
import { usePdfTemplates } from "@/hooks/usePdfTemplates";
import { useAuth } from "@/contexts/AuthContext";

const PdfTemplates = () => {
  const { user } = useAuth(); // Add this to get the authenticated user

  const {
    templates,
    isLoading,
    isEditing,
    currentTemplate,
    setIsEditing,
    setCurrentTemplate,
    createTemplate,
    updateTemplate,
    deleteTemplate
  } = usePdfTemplates();

  // Handler for creating new templates with user_id
  const handleCreateTemplate = async (templateData: any) => {
    if (!user) {
      console.error("No authenticated user found");
      return;
    }
    
    // Include the user_id when creating a new template
    await createTemplate({
      ...templateData,
      user_id: user.id
    });
  };

  // Handler for updating templates, preserving user_id
  const handleUpdateTemplate = async (templateData: any) => {
    await updateTemplate(templateData);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Configuración de Plantillas PDF</h1>
        <button
          className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
          onClick={() => {
            setCurrentTemplate(null);
            setIsEditing(true);
          }}
        >
          Nueva Plantilla
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <PdfTemplatesList
            templates={templates}
            isLoading={isLoading}
            onEdit={(template) => {
              setCurrentTemplate(template);
              setIsEditing(true);
            }}
            onDelete={deleteTemplate}
          />
        </CardContent>
      </Card>

      {isEditing && (
        <PdfTemplateDialog
          template={currentTemplate}
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={currentTemplate ? handleUpdateTemplate : handleCreateTemplate}
        />
      )}
    </div>
  );
};

export default PdfTemplates;
