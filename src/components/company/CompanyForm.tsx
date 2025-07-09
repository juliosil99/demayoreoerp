
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
import { AddressField } from "./form-fields/AddressField";
import { PhoneField } from "./form-fields/PhoneField";

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
      direccion: "",
      telefono: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        // Usar función atómica para actualizar empresa
        const { data: result, error } = await supabase.rpc('update_company_data', {
          p_nombre: data.nombre,
          p_rfc: data.rfc,
          p_codigo_postal: data.codigo_postal,
          p_regimen_fiscal: data.regimen_fiscal,
          p_direccion: data.direccion || null,
          p_telefono: data.telefono || null,
          p_user_id: userId
        });

        if (error) {
          toast.error("Error al actualizar la información");
          return;
        }

        const updateResult = result?.[0];
        if (!updateResult?.success) {
          const errorMessages = {
            'RFC_EXISTS': 'Ya tienes una empresa registrada con este RFC',
            'DUPLICATE_RFC': 'El RFC ya está registrado en el sistema',
            'UNAUTHORIZED': 'No autorizado para realizar esta acción',
            'UNKNOWN_ERROR': updateResult?.error_message || 'Error desconocido'
          };
          toast.error(errorMessages[updateResult?.error_code as keyof typeof errorMessages] || 'Error al actualizar la información');
          return;
        }
        
        toast.success("¡Información actualizada exitosamente!");
      } else {
        // Usar función atómica para crear empresa
        const { data: result, error } = await supabase.rpc('create_company_with_user_simple', {
          p_nombre: data.nombre,
          p_rfc: data.rfc,
          p_codigo_postal: data.codigo_postal,
          p_regimen_fiscal: data.regimen_fiscal,
          p_direccion: data.direccion || null,
          p_telefono: data.telefono || null,
          p_user_id: userId
        });

        if (error) {
          toast.error("Error al crear la empresa");
          return;
        }

        const createResult = result?.[0];
        if (!createResult?.success) {
          const errorMessages = {
            'RFC_EXISTS': 'Ya tienes una empresa registrada con este RFC',
            'DUPLICATE_COMPANY': 'Ya existe una empresa con este RFC en el sistema',
            'UNAUTHORIZED': 'No autorizado para realizar esta acción',
            'DATABASE_ERROR': 'Error en la base de datos',
            'UNKNOWN_ERROR': createResult?.error_message || 'Error desconocido'
          };
          toast.error(errorMessages[createResult?.error_code as keyof typeof errorMessages] || 'Error al crear la empresa');
          return;
        }

        toast.success("¡Empresa registrada exitosamente!");
      }
      
      onSubmitSuccess?.();
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error inesperado. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <CompanyNameField form={form} />
        <RFCField form={form} />
        <AddressField form={form} />
        <PostalCodeField form={form} />
        <PhoneField form={form} />
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
