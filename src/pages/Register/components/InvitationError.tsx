
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface InvitationErrorProps {
  error: string;
}

export function InvitationError({ error }: InvitationErrorProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-amber-500" />
          <h1 className="text-2xl font-bold text-red-600">Invitación no válida</h1>
          <p className="text-gray-600">{error}</p>
          
          <Button 
            onClick={() => navigate("/login")} 
            className="mt-4"
          >
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    </div>
  );
}
