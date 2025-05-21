
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface IncomeStatementErrorProps {
  error: Error | unknown;
}

export const IncomeStatementError: React.FC<IncomeStatementErrorProps> = () => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        No se pudo cargar el estado de resultados. Por favor, intente de nuevo más tarde.
      </AlertDescription>
    </Alert>
  );
};
