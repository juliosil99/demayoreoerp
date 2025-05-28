
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SimpleInvitationData {
  id: string;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  company_id?: string;
  invited_by: string;
}

interface RegistrationFormProps {
  invitation: SimpleInvitationData;
  companyName: string | null;
  loading: boolean;
  onSubmit: (invitation: SimpleInvitationData, password: string) => Promise<void>;
}

export function RegistrationForm({ invitation, companyName, loading, onSubmit }: RegistrationFormProps) {
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(invitation, password);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Completa tu registro</h1>
          <p className="text-gray-500">
            Bienvenido {invitation.email}.
          </p>
          {companyName && (
            <p className="text-sm font-medium">
              Estás siendo invitado a unirte a la empresa: <span className="text-primary">{companyName}</span>
            </p>
          )}
          <p className="text-gray-500 mt-2">
            Por favor, establece tu contraseña para completar el registro.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Procesando..." : "Completar registro"}
          </Button>
        </form>
      </div>
    </div>
  );
}
