
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  DollarSign, 
  Plus, 
  Trash2, 
  AlertCircle 
} from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { BankAccount } from "@/components/banking/types";
import { addMonths, format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface CreditPayment {
  id: string;
  account_id: number;
  due_date: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  payment_id?: string;
  created_at: string;
}

export function CreditPaymentSchedule() {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [newPayment, setNewPayment] = useState({
    due_date: format(new Date(), 'yyyy-MM-dd'),
    amount: 0
  });
  const [generateMonths, setGenerateMonths] = useState(6);

  // Fetch account details
  const {
    data: account,
    isLoading: isLoadingAccount,
    error: accountError
  } = useQuery({
    queryKey: ["bank-account", Number(accountId)],
    queryFn: async () => {
      if (!accountId) return null;
      
      const { data, error } = await supabase
        .from("bank_accounts")
        .select("*")
        .eq("id", accountId)
        .single();
        
      if (error) throw error;
      return data as BankAccount;
    },
    enabled: !!accountId
  });

  // Fetch payment schedule
  const {
    data: payments = [],
    isLoading: isLoadingPayments,
    error: paymentsError
  } = useQuery({
    queryKey: ["credit-payments", accountId],
    queryFn: async () => {
      if (!accountId) return [];
      
      const { data, error } = await supabase
        .from("credit_payment_schedules")
        .select("*")
        .eq("account_id", accountId)
        .order("due_date", { ascending: true });
        
      if (error) throw error;
      return data as CreditPayment[];
    },
    enabled: !!accountId
  });

  // Add new payment
  const addPayment = useMutation({
    mutationFn: async (payment: { due_date: string, amount: number }) => {
      const { error } = await supabase
        .from("credit_payment_schedules")
        .insert({
          account_id: Number(accountId),
          due_date: payment.due_date,
          amount: payment.amount,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-payments", accountId] });
      setShowAddDialog(false);
      setNewPayment({
        due_date: format(new Date(), 'yyyy-MM-dd'),
        amount: 0
      });
    }
  });

  // Delete payment
  const deletePayment = useMutation({
    mutationFn: async (paymentId: string) => {
      const { error } = await supabase
        .from("credit_payment_schedules")
        .delete()
        .eq("id", paymentId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-payments", accountId] });
    }
  });

  // Generate payments
  const generatePayments = useMutation({
    mutationFn: async (months: number) => {
      if (!account || !account.payment_due_day) {
        throw new Error("La cuenta no tiene configurado el día de pago");
      }
      
      const payments = [];
      const amount = account.type === "Credit Card" 
        ? (account.balance ?? 0) * (account.minimum_payment_percentage ?? 10) / 100
        : account.monthly_payment ?? 0;
      
      // Create a base date using the account's payment day
      let currentDate = new Date();
      currentDate.setDate(account.payment_due_day);
      
      // If today is past the payment day, start from next month
      if (new Date().getDate() > account.payment_due_day) {
        currentDate = addMonths(currentDate, 1);
      }
      
      for (let i = 0; i < months; i++) {
        const paymentDate = addMonths(currentDate, i);
        
        payments.push({
          account_id: Number(accountId),
          due_date: format(paymentDate, 'yyyy-MM-dd'),
          amount: amount,
          status: 'pending',
          user_id: (await supabase.auth.getUser()).data.user?.id
        });
      }
      
      const { error } = await supabase
        .from("credit_payment_schedules")
        .insert(payments);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["credit-payments", accountId] });
      setShowGenerateDialog(false);
    }
  });

  // Check for overdue payments and update status
  useEffect(() => {
    const checkOverduePayments = async () => {
      const today = new Date();
      const overduePayments = payments.filter(p => {
        return p.status === 'pending' && new Date(p.due_date) < today;
      });
      
      if (overduePayments.length > 0) {
        const updates = overduePayments.map(p => ({
          id: p.id,
          status: 'overdue'
        }));
        
        for (const update of updates) {
          await supabase
            .from("credit_payment_schedules")
            .update({ status: 'overdue' })
            .eq("id", update.id);
        }
        
        if (updates.length > 0) {
          queryClient.invalidateQueries({ queryKey: ["credit-payments", accountId] });
        }
      }
    };
    
    checkOverduePayments();
  }, [payments, accountId, queryClient]);

  if (accountError || paymentsError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Error al cargar los datos: {(accountError || paymentsError)?.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoadingAccount) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/accounting/banking")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Cuentas
        </Button>
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="space-y-4">
        <Button variant="outline" onClick={() => navigate("/accounting/banking")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Cuentas
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Cuenta no encontrada</AlertTitle>
          <AlertDescription>
            No se encontró la cuenta especificada.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => navigate("/accounting/banking")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Cuentas
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowGenerateDialog(true)}>
            <Calendar className="mr-2 h-4 w-4" />
            Generar Pagos Automáticos
          </Button>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Pago
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Calendario de Pagos - {account.name}
          </CardTitle>
          <CardDescription>
            {account.type === "Credit Card" 
              ? "Tarjeta de Crédito"
              : "Crédito Simple"}
            {account.payment_due_day && ` - Día de pago: ${account.payment_due_day}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingPayments ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No hay pagos programados</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Agrega pagos manualmente o genera un calendario automático.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Pago
                </Button>
                <Button variant="outline" onClick={() => setShowGenerateDialog(true)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Generar Pagos Automáticos
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(parseISO(payment.due_date), 'd MMMM yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          payment.status === 'paid' ? 'default' :
                          payment.status === 'overdue' ? 'destructive' : 'outline'
                        }
                      >
                        {payment.status === 'paid' ? 'Pagado' :
                         payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {payment.status !== 'paid' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar este pago?')) {
                              deletePayment.mutate(payment.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Add Payment Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Pago Programado</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="date">Fecha de Pago</Label>
              <Input
                id="date"
                type="date"
                value={newPayment.due_date}
                onChange={(e) => setNewPayment({ ...newPayment, due_date: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={newPayment.amount}
                onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => addPayment.mutate(newPayment)}
              disabled={!newPayment.due_date || newPayment.amount <= 0}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Generate Payments Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Pagos Automáticos</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {!account.payment_due_day && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuración incompleta</AlertTitle>
                <AlertDescription>
                  Esta cuenta no tiene configurado el día de pago. Por favor, edita la cuenta para agregar esta información.
                </AlertDescription>
              </Alert>
            )}
            
            {(account.type === "Credit Card" && !account.minimum_payment_percentage) && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuración incompleta</AlertTitle>
                <AlertDescription>
                  Esta tarjeta no tiene configurado el porcentaje de pago mínimo. Por favor, edita la cuenta para agregar esta información.
                </AlertDescription>
              </Alert>
            )}
            
            {(account.type === "Credit Simple" && !account.monthly_payment) && (
              <Alert className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Configuración incompleta</AlertTitle>
                <AlertDescription>
                  Este crédito no tiene configurado el pago mensual. Por favor, edita la cuenta para agregar esta información.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="months">Número de Meses</Label>
                <Input
                  id="months"
                  type="number"
                  min="1"
                  max="36"
                  value={generateMonths}
                  onChange={(e) => setGenerateMonths(parseInt(e.target.value) || 6)}
                />
                <p className="text-sm text-muted-foreground">
                  Se generarán {generateMonths} pagos mensuales a partir del próximo día de pago.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label>Monto de Cada Pago</Label>
                <div className="flex items-center rounded-md border px-3 py-2 bg-muted/50">
                  <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {account.type === "Credit Card" 
                      ? formatCurrency((account.balance ?? 0) * (account.minimum_payment_percentage ?? 10) / 100) 
                      : formatCurrency(account.monthly_payment ?? 0)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {account.type === "Credit Card" 
                    ? `${account.minimum_payment_percentage ?? 10}% del saldo actual (${formatCurrency(account.balance ?? 0)})`
                    : 'Pago mensual configurado'}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => generatePayments.mutate(generateMonths)}
              disabled={
                !account.payment_due_day || 
                (account.type === "Credit Card" && !account.minimum_payment_percentage) ||
                (account.type === "Credit Simple" && !account.monthly_payment)
              }
            >
              Generar Pagos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
