
import { toast } from "@/hooks/use-toast";

export const validateImportFile = (file: File | null) => {
  if (!file) {
    toast({
      title: "Error",
      description: "Seleccione un archivo para importar.",
      variant: "destructive"
    });
    return false;
  }

  if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
    toast({
      title: "Error",
      description: "El archivo debe ser CSV o XLSX.",
      variant: "destructive"
    });
    return false;
  }

  return true;
};
