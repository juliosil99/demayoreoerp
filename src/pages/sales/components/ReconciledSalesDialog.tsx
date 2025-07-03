
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import { UnreconciledSale } from "@/components/payments/types/UnreconciledSale";
import { Skeleton } from "@/components/ui/skeleton";

interface ReconciledSalesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentId: string | null;
}

export function ReconciledSalesDialog({
  open,
  onOpenChange,
  paymentId,
}: ReconciledSalesDialogProps) {
  const [sales, setSales] = useState<UnreconciledSale[]>([]);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && paymentId) {
      loadReconciledSales(paymentId);
    } else {
      setSales([]);
      setPayment(null);
    }
  }, [open, paymentId]);

  async function loadReconciledSales(id: string) {
    setLoading(true);
    try {
      // Fetch the payment details
      const { data: paymentData, error: paymentError } = await supabase
        .from("payments")
        .select("*, sales_channels(name), bank_accounts(name)")
        .eq("id", id)
        .single();

      if (paymentError) throw paymentError;
      setPayment(paymentData);

      // Fetch the reconciled sales for this payment
      const { data: salesData, error: salesError } = await supabase
        .from("Sales")
        .select("*")
        .eq("reconciliation_id", id)
        .order("date", { ascending: false });

      if (salesError) throw salesError;
      setSales(salesData as UnreconciledSale[]);
    } catch (error) {
      console.error("Error loading reconciled sales:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalAmount = sales.reduce((sum, sale) => sum + (sale.price || 0), 0);
  const totalCommissions = sales.reduce((sum, sale) => sum + (sale.comission || 0), 0);
  const totalShipping = sales.reduce((sum, sale) => sum + (sale.shipping || 0), 0);
  const netAmount = totalAmount - totalCommissions - totalShipping;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ventas Reconciliadas</DialogTitle>
          <DialogDescription>
            {payment ? (
              <div className="mt-2">
                <p>
                  <span className="font-medium">Fecha:</span> {formatCardDate(payment.date)}
                </p>
                <p>
                  <span className="font-medium">Canal:</span> {payment.sales_channels?.name || 'No especificado'}
                </p>
                <p>
                  <span className="font-medium">Método de pago:</span>{" "}
                  {payment.payment_method === "cash"
                    ? "Efectivo"
                    : payment.payment_method === "transfer"
                    ? "Transferencia"
                    : payment.payment_method === "check"
                    ? "Cheque"
                    : "Tarjeta de Crédito"}
                </p>
                <p>
                  <span className="font-medium">Referencia:</span> {payment.reference_number || "No especificada"}
                </p>
              </div>
            ) : loading ? (
              <div className="space-y-2 mt-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8">
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 border rounded-md bg-background">
                <div className="text-sm text-muted-foreground">Ventas Reconciliadas</div>
                <div className="text-2xl font-bold">{sales.length}</div>
              </div>
              <div className="p-4 border rounded-md bg-background">
                <div className="text-sm text-muted-foreground">Monto Bruto</div>
                <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              </div>
              <div className="p-4 border rounded-md bg-background">
                <div className="text-sm text-muted-foreground">Monto Neto</div>
                <div className="text-2xl font-bold">{formatCurrency(netAmount)}</div>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Orden</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Comisión</TableHead>
                    <TableHead className="text-right">Envío</TableHead>
                    <TableHead className="text-right">Neto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>{formatCardDate(sale.date || '')}</TableCell>
                      <TableCell>{sale.orderNumber}</TableCell>
                      <TableCell>{sale.Channel}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={sale.productName || ''}>
                        {sale.productName}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(sale.price)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(sale.comission)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(sale.shipping)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency((sale.price || 0) - (sale.comission || 0) - (sale.shipping || 0))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
