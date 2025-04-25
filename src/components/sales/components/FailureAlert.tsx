
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { FailureAlertProps } from "../types";

export const FailureAlert = ({ failedImports, onDownload }: FailureAlertProps) => {
  if (failedImports.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertDescription>
        <div className="text-sm mb-2">
          No se pudieron importar {failedImports.length} registros.
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onDownload}
          className="w-full flex items-center justify-center"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar detalle de errores
        </Button>
      </AlertDescription>
    </Alert>
  );
};
