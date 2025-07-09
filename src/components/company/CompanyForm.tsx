
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
      console.log('🏢 Starting company registration/update process...', { 
        isEditing, 
        rfc: data.rfc,
        userId 
      });
      
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

        console.log('📝 Update company result:', { result, error });

        if (error) {
          console.error('❌ Error updating company:', error);
          toast.error(`Error al actualizar: ${error.message}`);
          return;
        }

        const updateResult = result?.[0];
        console.log('📋 Update result details:', updateResult);
        
        if (!updateResult?.success) {
          console.error('❌ Update failed:', updateResult);
          const errorMessages = {
            'RFC_EXISTS': 'Ya tienes una empresa registrada con este RFC',
            'DUPLICATE_RFC': 'El RFC ya está registrado en el sistema',  
            'UNAUTHORIZED': 'No autorizado para realizar esta acción',
            'UNKNOWN_ERROR': updateResult?.error_message || 'Error desconocido'
          };
          toast.error(errorMessages[updateResult?.error_code as keyof typeof errorMessages] || 'Error al actualizar la información');
          return;
        }
        
        console.log('✅ Company updated successfully');
        toast.success("¡Información actualizada exitosamente!");
      } else {
        // Usar función atómica para crear empresa - logging detallado
        console.log('🆕 Creating company with data:', {
          nombre: data.nombre,
          rfc: data.rfc,
          codigo_postal: data.codigo_postal,
          regimen_fiscal: data.regimen_fiscal,
          user_id: userId
        });

        const { data: result, error } = await supabase.rpc('create_company_with_user_simple', {
          p_nombre: data.nombre,
          p_rfc: data.rfc,
          p_codigo_postal: data.codigo_postal,
          p_regimen_fiscal: data.regimen_fiscal,
          p_direccion: data.direccion || null,
          p_telefono: data.telefono || null,
          p_user_id: userId
        });

        console.log('🏢 Create company raw result:', { result, error });

        if (error) {
          console.error('❌ Supabase RPC error:', error);
          toast.error(`Error de base de datos: ${error.message}`);
          return;
        }

        if (!result || result.length === 0) {
          console.error('❌ No result returned from RPC');
          toast.error("No se recibió respuesta del servidor");
          return;
        }

        const createResult = result[0];
        console.log('📋 Create result details:', createResult);
        
        if (!createResult?.success) {
          console.error('❌ Company creation failed:', createResult);
          const errorMessages = {
            'RFC_EXISTS': 'Ya tienes una empresa registrada con este RFC',
            'DUPLICATE_COMPANY': 'Ya existe una empresa con este RFC en el sistema',
            'UNAUTHORIZED': 'No autorizado para realizar esta acción',
            'DATABASE_ERROR': 'Error en la base de datos',
            'UNKNOWN_ERROR': createResult?.error_message || 'Error desconocido'
          };
          const message = errorMessages[createResult?.error_code as keyof typeof errorMessages] || 'Error al crear la empresa';
          toast.error(message);
          return;
        }

        console.log('✅ Company created successfully with ID:', createResult.company_id);
        toast.success("¡Empresa registrada exitosamente! Redirigiendo...");
      }
      
      // Small delay before navigation to show success message
      setTimeout(() => {
        onSubmitSuccess?.();
        navigate("/dashboard");
      }, 1000);
    } catch (error) {
      console.error('💥 Unexpected error in company form:', error);
      toast.error(`Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
