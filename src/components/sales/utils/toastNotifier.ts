
import { toast } from "@/hooks/use-toast";

export const showImportToasts = (successCount: number, errorCount: number) => {
  if (successCount > 0) {
    toast({
      title: "Importación Exitosa",
      description: `${successCount} ventas importadas exitosamente.`,
    });
  }
  
  if (errorCount > 0) {
    toast({
      title: "Error",
      description: `${errorCount} ventas no pudieron importarse.`,
      variant: "destructive"
    });
  }
};
