
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { read, utils } from "xlsx";
import { supabase } from "@/lib/supabase";
import { ContactFormValues } from "./types";
import { contactSchema } from "./schema";

export function ContactImporter({ onSuccess }: { onSuccess: () => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const processFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

    return jsonData.map((row: any) => ({
      name: row.Nombre || row.name || "",
      rfc: row.RFC || row.rfc || "",
      phone: row.Teléfono || row.phone || "",
      type: (row.Tipo || row.type || "client").toLowerCase(),
      tax_regime: row["Régimen Fiscal"] || row.tax_regime || "",
      postal_code: row["Código Postal"] || row.postal_code || "",
      address: row.Dirección || row.address || "",
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files;
      if (!files || files.length === 0 || !user?.id) return;

      const file = files[0];
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        toast.error('Por favor sube un archivo CSV o XLSX');
        return;
      }

      setIsUploading(true);
      const contacts = await processFile(file);
      
      let successCount = 0;
      let errorCount = 0;

      for (const contactData of contacts) {
        try {
          // Validate contact data
          const validatedContact = contactSchema.parse(contactData);
          
          const { error } = await supabase
            .from('contacts')
            .insert([{ ...validatedContact, user_id: user.id }]);

          if (error) {
            console.error('Error importing contact:', error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error('Validation error:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast.success(`${successCount} contactos importados exitosamente`);
        onSuccess();
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} contactos no pudieron ser importados`);
      }

    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Error al procesar el archivo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileUpload}
        disabled={isUploading}
        className="max-w-xs"
      />
      <Button disabled={isUploading}>
        {isUploading ? (
          "Importando..."
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            Importar Contactos
          </>
        )}
      </Button>
    </div>
  );
}
