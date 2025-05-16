
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { PaymentSelector } from "./components/PaymentSelector"; // Fixed import path
import { useToast } from "@/hooks/use-toast";
import { Payment } from "./PaymentForm";
import { ReconciliationFilters } from "./components/ReconciliationFilters";

interface BulkReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReconcile: ({ salesIds, paymentId }: { salesIds: number[], paymentId: string }) => void;
}

export function BulkReconciliationDialog({
  open,
  onOpenChange,
  onReconcile,
}: BulkReconciliationDialogProps) {
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | undefined>(undefined);
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [orderNumbers, setOrderNumbers] = useState("");
  const [dateRange, setDateRange] = useState<undefined>();
  const [salesIds, setSalesIds] = useState<number[]>([]);
  const { toast } = useToast();

  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
  };

  const handleChannelChange = (channel: string) => {
    setSelectedChannel(channel);
  };

  const handleOrderNumbersChange = (orders: string) => {
    setOrderNumbers(orders);
  };

  const handleDateRangeChange = (range: any) => {
    setDateRange(range);
  };

  const handleResetFilters = () => {
    setSelectedChannel("all");
    setOrderNumbers("");
    setDateRange(undefined);
  };

  const handleReconcile = () => {
    if (!selectedPaymentId) {
      toast({
        title: "Error",
        description: "Por favor, selecciona un pago para reconciliar.",
        variant: "destructive",
      });
      return;
    }

    if (!salesIds.length) {
      toast({
        title: "Error",
        description: "Por favor, introduce los IDs de las ventas a reconciliar.",
        variant: "destructive",
      });
      return;
    }

    onReconcile({ salesIds, paymentId: selectedPaymentId });
    onOpenChange(false);
  };

  const formattedPayment = {
    status: 'confirmed' as const
  } as Payment;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Reconciliación Masiva
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reconciliación Masiva de Ventas</AlertDialogTitle>
          <AlertDialogDescription>
            Selecciona un pago y los IDs de las ventas a reconciliar.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ReconciliationFilters
          selectedChannel={selectedChannel}
          onChannelChange={handleChannelChange}
          orderNumbers={orderNumbers}
          onOrderNumbersChange={handleOrderNumbersChange}
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
          onReset={handleResetFilters}
        />

        <PaymentSelector
          selectedPaymentId={selectedPaymentId}
          onPaymentSelect={handlePaymentSelect}
          selectedChannel={selectedChannel}
        />

        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="salesIds">IDs de Ventas (separados por comas)</Label>
            <Input
              id="salesIds"
              placeholder="Ej: 123,456,789"
              onChange={(e) => {
                const ids = e.target.value
                  .split(",")
                  .map((id) => parseInt(id.trim(), 10))
                  .filter((id) => !isNaN(id));
                setSalesIds(ids);
              }}
            />
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleReconcile}>Reconciliar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
