
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PaymentForm } from "@/components/payments/PaymentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

type Payment = {
  id: string;
  date: string;
  amount: number;
  payment_method: string;
  reference_number: string | null;
  contacts: { name: string } | null;
  bank_accounts: { name: string };
};

export default function Payments() {
  const { user } = useAuth();
  const [isAddingPayment, setIsAddingPayment] = useState(false);

  const { data: payments, isLoading } = useQuery({
    queryKey: ["payments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          contacts (name),
          bank_accounts (name)
        `)
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
    enabled: !!user,
  });

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Pagos Recibidos</h1>
        <Dialog open={isAddingPayment} onOpenChange={setIsAddingPayment}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="w-4 h-4 mr-2" />
              Agregar Pago
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Nuevo Pago</DialogTitle>
            </DialogHeader>
            <PaymentForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{format(new Date(payment.date), 'dd/MM/yyyy')}</TableCell>
                <TableCell>{payment.contacts?.name}</TableCell>
                <TableCell>{payment.bank_accounts.name}</TableCell>
                <TableCell>
                  {payment.payment_method === 'cash' ? 'Efectivo' :
                   payment.payment_method === 'transfer' ? 'Transferencia' :
                   payment.payment_method === 'check' ? 'Cheque' : 'Tarjeta de Crédito'}
                </TableCell>
                <TableCell>{payment.reference_number || '-'}</TableCell>
                <TableCell className="text-right">${payment.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
