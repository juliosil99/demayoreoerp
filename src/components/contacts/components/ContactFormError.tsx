
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ContactFormErrorProps {
  error: string | null;
}

export const ContactFormError = ({ error }: ContactFormErrorProps) => {
  if (!error) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
};
