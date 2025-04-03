
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayableRow } from "./PayableRow";
import { AccountPayable } from "@/types/payables";
import { PayableStatusFilter } from "../hooks/useFetchPayables";

interface PayablesListProps {
  payables: AccountPayable[] | undefined;
  isLoading: boolean;
  onMarkAsPaid: (id: string) => void;
  onEdit: (payable: AccountPayable) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
  isDeleting: boolean;
  statusFilter: PayableStatusFilter;
}

export function PayablesList({ 
  payables, 
  isLoading, 
  onMarkAsPaid, 
  onEdit,
  onDelete,
  isPending,
  isDeleting,
  statusFilter 
}: PayablesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Cuentas por Pagar</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Cargando...</div>
        ) : payables && payables.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha de Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payables.map((payable) => (
                <PayableRow 
                  key={payable.id}
                  payable={payable}
                  onMarkAsPaid={onMarkAsPaid}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  isPending={isPending}
                  isDeleting={isDeleting}
                />
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-6">
            {statusFilter === "pending" && (
              <p>No hay cuentas pendientes por pagar.</p>
            )}
            {statusFilter === "paid" && (
              <p>No hay cuentas pagadas.</p>
            )}
            {statusFilter === "all" && (
              <p>No hay cuentas por pagar registradas.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
