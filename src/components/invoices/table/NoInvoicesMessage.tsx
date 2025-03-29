
import React from "react";

export const NoInvoicesMessage: React.FC = () => {
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">No se encontraron facturas que coincidan con los filtros aplicados.</p>
    </div>
  );
};
