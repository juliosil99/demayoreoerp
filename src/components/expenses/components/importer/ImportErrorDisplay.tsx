
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ImportErrorDisplayProps {
  errors: string[];
  showErrors: boolean;
}

export function ImportErrorDisplay({ errors, showErrors }: ImportErrorDisplayProps) {
  if (!showErrors || errors.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertDescription>
        <div className="max-h-40 overflow-y-auto text-xs">
          <p className="font-semibold mb-2">Errores encontrados:</p>
          <ul className="list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  );
}
