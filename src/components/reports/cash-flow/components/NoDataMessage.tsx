
import React from "react";

interface NoDataMessageProps {
  hasData: boolean;
}

export const NoDataMessage: React.FC<NoDataMessageProps> = ({ hasData }) => {
  if (hasData) return null;
  
  return (
    <div className="mt-4 border border-yellow-200 bg-yellow-50 p-4 rounded-md">
      <h3 className="text-sm font-medium text-yellow-800">No hay datos de cuentas</h3>
      <p className="text-sm text-yellow-700 mt-1">
        Para ver reportes financieros, necesita agregar saldos a sus cuentas para este período.
      </p>
    </div>
  );
};
