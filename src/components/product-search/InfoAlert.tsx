
import React from "react";
import { Info } from "lucide-react";

export const InfoAlert: React.FC = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-amber-800 flex items-start gap-2 mb-4">
      <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
      <div>
        <p className="font-medium">Información sobre generación de PDFs</p>
        <p className="text-sm">
          Todos los documentos pueden generar un PDF aunque algunos pueden tener datos incompletos. 
          Los PDFs se generarán con los datos disponibles en el sistema.
        </p>
      </div>
    </div>
  );
};
