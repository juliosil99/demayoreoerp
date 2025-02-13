
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { CompanyFormData } from "./types";
import { CompanyNameField } from "./form-fields/CompanyNameField";
import { RFCField } from "./form-fields/RFCField";
import { PostalCodeField } from "./form-fields/PostalCodeField";
import { TaxRegimeField } from "./form-fields/TaxRegimeField";
import { checkRFCExists } from "@/hooks/company/useCompanyData";

interface CompanyFormProps {
  defaultValues?: CompanyFormData;
  isEditing: boolean;
  userId: string;
  onSubmitSuccess?: () => void;
}

export function CompanyForm({ defaultValues, isEditing, userId, onSubmitSuccess }: CompanyFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<CompanyFormData>({
    defaultValues: defaultValues || {
      nombre: "",
      rfc: "",
      codigo_postal: "",
      regimen_fiscal: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      // Verificar RFC solo si es nuevo registro o si cambió el RFC
      if (!isEditing || (defaultValues && defaultValues.rfc !== data.rfc)) {
        console.log("🔍 Verifying RFC:", data.rfc);
        const rfcExists = await checkRFCExists(data.rfc);
        if (rfcExists) {
          console.log("❌ RFC already exists");
          toast.error("El RFC ya está registrado en el sistema");
          setIsLoading(false);
          return;
        }
        console.log("✅ RFC is available");
      }

      if (isEditing) {
        console.log("📝 Updating company data...");
        const { error } = await supabase
          .from("companies")
          .update(data)
          .eq("user_id", userId)
          .select();

        if (error) {
          console.error("❌ Error updating company:", error);
          toast.error(error.code === '23505' 
            ? "El RFC ya está registrado en el sistema"
            : "Error al actualizar la información");
          return;
        }
        
        console.log("✅ Company updated successfully");
        toast.success("¡Información actualizada exitosamente!");
      } else {
        console.log("📝 Creating new company...");
        const { error } = await supabase
          .from("companies")
          .insert([{
            ...data,
            user_id: userId,
          }])
          .select();

        if (error) {
          console.error("❌ Error creating company:", error);
          toast.error(error.code === '23505'
            ? "El RFC ya está registrado en el sistema"
            : "Error al guardar la información");
          return;
        }

        console.log("✅ Company created successfully");
        toast.success("¡Empresa registrada exitosamente!");
      }
      
      onSubmitSuccess?.();
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Unexpected error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CompanyNameField form={form} />
        <RFCField form={form} />
        <PostalCodeField form={form} />
        <TaxRegimeField form={form} />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            "Guardando..."
          ) : (
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isEditing ? "Guardar Cambios" : "Guardar Información"}
            </div>
          )}
        </Button>
      </form>
    </Form>
  );
}
