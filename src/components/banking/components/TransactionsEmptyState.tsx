
import React from "react";

export function TransactionsEmptyState() {
  return (
    <div className="text-center p-8 border rounded-md">
      <h3 className="text-lg font-medium">No hay movimientos</h3>
      <p className="text-muted-foreground">
        Esta cuenta no tiene movimientos registrados.
      </p>
    </div>
  );
}
