
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { BankStatementsTable } from "@/integrations/supabase/types/bank-statements";

interface UseStatementUploadProps {
  accountId: number;
  onSuccess?: () => void;
}

export function useStatementUpload({ accountId, onSuccess }: UseStatementUploadProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 5 + i).map(y => y.toString());

  const months = [
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file || !month || !year || !user?.id) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    setUploading(true);

    try {
      const timestamp = Date.now();
      const uniqueFilename = `${timestamp}_${file.name}`;
      const filePath = `${user.id}/${accountId}/${uniqueFilename}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('bank_statements')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Error al subir el archivo: ${uploadError.message}`);
      }

      const { error: dbError } = await supabase
        .from("bank_statements")
        .insert({
          user_id: user.id,
          account_id: accountId,
          filename: file.name,
          file_path: filePath,
          content_type: file.type,
          size: file.size,
          month: parseInt(month),
          year: parseInt(year),
          description: description || null
        } as BankStatementsTable['Insert']);

      if (dbError) {
        await supabase.storage
          .from('bank_statements')
          .remove([filePath]);
          
        throw new Error(`Error al registrar el archivo: ${dbError.message}`);
      }

      toast.success("Estado de cuenta subido correctamente");
      setFile(null);
      setDescription("");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return {
    file,
    month,
    year,
    description,
    uploading,
    months,
    years,
    setMonth,
    setYear,
    setDescription,
    handleFileChange,
    handleUpload
  };
}
