
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BulkReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReconcile: (data: {
    salesIds: number[];
    paymentData: {
      date: string;
      amount: number;
      account_id: number;
      payment_method: string;
      reference_number?: string;
    };
  }) => void;
}

export function BulkReconciliationDialog({
  open,
  onOpenChange,
  onReconcile,
}: BulkReconciliationDialogProps) {
  const [selectedChannel, setSelectedChannel] = useState<string>("");
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({
    from: format(new Date(), 'yyyy-MM-dd'),
    to: format(new Date(), 'yyyy-MM-dd'),
  });
  const [paymentDetails, setPaymentDetails] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    account_id: "",
    payment_method: "transfer",
    reference_number: "",
  });

  const { data: bankAccounts } = useQuery({
    queryKey: ["bankAccounts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: unreconciled, isLoading } = useQuery({
    queryKey: ["unreconciled-sales", selectedChannel, dateRange],
    queryFn: async () => {
      let query = supabase
        .from("Sales")
        .select("*")
        .is("reconciliation_id", null)
        .eq("statusPaid", "por cobrar");

      if (selectedChannel) {
        query = query.eq("Channel", selectedChannel);
      }

      if (dateRange.from && dateRange.to) {
        query = query
          .gte("date", dateRange.from)
          .lte("date", dateRange.to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const calculateTotals = (sales: any[]) => {
    return sales?.reduce((acc, sale) => ({
      subtotal: acc.subtotal + (sale.price || 0),
      commission: acc.commission + (sale.comission || 0),
      shipping: acc.shipping + (sale.shipping || 0),
      retention: acc.retention + (sale.retention || 0),
      total: acc.total + ((sale.price || 0) - (sale.comission || 0) - (sale.shipping || 0) - (sale.retention || 0))
    }), {
      subtotal: 0,
      commission: 0,
      shipping: 0,
      retention: 0,
      total: 0
    });
  };

  const totals = calculateTotals(unreconciled || []);

  const handleReconcile = () => {
    if (!unreconciled?.length) return;
    
    onReconcile({
      salesIds: unreconciled.map(sale => sale.id),
      paymentData: {
        ...paymentDetails,
        amount: totals.total,
        account_id: parseInt(paymentDetails.account_id),
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Reconciliación Masiva de Ventas</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <Label>Canal</Label>
            <Select
              value={selectedChannel}
              onValueChange={setSelectedChannel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="mercadolibre">Mercado Libre</SelectItem>
                <SelectItem value="walmart">Walmart</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Desde</Label>
            <Input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            />
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>No. Orden</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Comisión</TableHead>
                <TableHead>Envío</TableHead>
                <TableHead>Retención</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : unreconciled?.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{format(new Date(sale.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{sale.orderNumber}</TableCell>
                  <TableCell>${sale.price?.toFixed(2)}</TableCell>
                  <TableCell>${sale.comission?.toFixed(2)}</TableCell>
                  <TableCell>${sale.shipping?.toFixed(2)}</TableCell>
                  <TableCell>${sale.retention?.toFixed(2)}</TableCell>
                  <TableCell>
                    ${((sale.price || 0) - (sale.comission || 0) - (sale.shipping || 0) - (sale.retention || 0)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <Label>Fecha de Pago</Label>
            <Input
              type="date"
              value={paymentDetails.date}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div>
            <Label>Cuenta</Label>
            <Select
              value={paymentDetails.account_id}
              onValueChange={(value) => setPaymentDetails(prev => ({ ...prev, account_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar cuenta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts?.map((account) => (
                  <SelectItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Método de Pago</Label>
            <Select
              value={paymentDetails.payment_method}
              onValueChange={(value) => setPaymentDetails(prev => ({ ...prev, payment_method: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="check">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Referencia</Label>
            <Input
              value={paymentDetails.reference_number}
              onChange={(e) => setPaymentDetails(prev => ({ ...prev, reference_number: e.target.value }))}
              placeholder="Número de referencia"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Subtotal: ${totals.subtotal.toFixed(2)}</p>
              <p className="text-sm font-medium">Comisiones: ${totals.commission.toFixed(2)}</p>
              <p className="text-sm font-medium">Envíos: ${totals.shipping.toFixed(2)}</p>
              <p className="text-sm font-medium">Retenciones: ${totals.retention.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Total a Recibir: ${totals.total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleReconcile}
            disabled={!unreconciled?.length || !paymentDetails.account_id}
          >
            Reconciliar {unreconciled?.length || 0} Ventas
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
