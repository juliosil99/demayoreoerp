
import { Building } from "lucide-react";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CompanySetupHeaderProps {
    isEditing: boolean;
}

export function CompanySetupHeader({ isEditing }: CompanySetupHeaderProps) {
  return (
    <CardHeader className="space-y-1">
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6" />
        <CardTitle className="text-2xl">
          {isEditing ? "Editar Información de Empresa" : "Configuración de Empresa"}
        </CardTitle>
      </div>
      <CardDescription>
        {isEditing 
          ? "Actualiza la información de tu empresa"
          : "Ingresa la información de tu empresa para comenzar"
        }
      </CardDescription>
    </CardHeader>
  );
}
