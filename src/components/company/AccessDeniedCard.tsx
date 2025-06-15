
import { Building } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AccessDeniedCard() {
  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Building className="h-6 w-6" />
          <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
        </div>
        <CardDescription>
          No tienes permiso para configurar o editar una empresa. Contacta al administrador para obtener una invitación.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
