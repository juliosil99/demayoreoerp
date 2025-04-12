
import React from "react";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { usePaymentSchedule } from "./usePaymentSchedule";
import { EmptyScheduleState } from "./EmptyScheduleState";
import { PaymentsTable } from "./PaymentsTable";
import { AddPaymentDialog } from "./AddPaymentDialog";
import { GeneratePaymentsDialog } from "./GeneratePaymentsDialog";

export function CreditPaymentSchedule() {
  const {
    account,
    payments,
    isLoadingAccount,
    isLoadingPayments,
    accountError,
    paymentsError,
    navigate,
    showAddDialog,
    setShowAddDialog,
    showGenerateDialog,
    setShowGenerateDialog,
    newPayment,
    setNewPayment,
    generateMonths,
    setGenerateMonths,
    handleAddPayment,
    handleDeletePayment,
    handleGeneratePayments
  } = usePaymentSchedule();

  // Handle errors
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

  // Loading state
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

  // Account not found
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
            <EmptyScheduleState 
              onAddPayment={() => setShowAddDialog(true)} 
              onGeneratePayments={() => setShowGenerateDialog(true)} 
            />
          ) : (
            <PaymentsTable 
              payments={payments} 
              onDeletePayment={handleDeletePayment} 
            />
          )}
        </CardContent>
      </Card>
      
      {/* Add Payment Dialog */}
      <AddPaymentDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        payment={newPayment}
        onPaymentChange={setNewPayment}
        onSave={handleAddPayment}
      />
      
      {/* Generate Payments Dialog */}
      <GeneratePaymentsDialog
        open={showGenerateDialog}
        onOpenChange={setShowGenerateDialog}
        account={account}
        months={generateMonths}
        onMonthsChange={setGenerateMonths}
        onGenerate={handleGeneratePayments}
      />
    </div>
  );
}
