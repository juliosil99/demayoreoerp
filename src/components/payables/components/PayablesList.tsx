
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PayableRow } from "./PayableRow";
import { AccountPayable } from "@/types/payables";

interface PayablesListProps {
  payables: AccountPayable[] | undefined;
  isLoading: boolean;
  onMarkAsPaid: (id: string) => void;
  isPending: boolean;
}

export function PayablesList({ payables, isLoading, onMarkAsPaid, isPending }: PayablesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Cuentas por Pagar</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Cargando...</div>
        ) : (
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
              {payables?.map((payable) => (
                <PayableRow 
                  key={payable.id}
                  payable={payable}
                  onMarkAsPaid={onMarkAsPaid}
                  isPending={isPending}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
