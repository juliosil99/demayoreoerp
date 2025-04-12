
import React from "react";
import { Calendar, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyScheduleStateProps {
  onAddPayment: () => void;
  onGeneratePayments: () => void;
}

export function EmptyScheduleState({ onAddPayment, onGeneratePayments }: EmptyScheduleStateProps) {
  return (
    <div className="text-center py-8">
      <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No hay pagos programados</h3>
      <p className="text-sm text-muted-foreground mt-2">
        Agrega pagos manualmente o genera un calendario automático.
      </p>
      <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-center">
        <Button onClick={onAddPayment}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Pago
        </Button>
        <Button variant="outline" onClick={onGeneratePayments}>
          <Calendar className="mr-2 h-4 w-4" />
          Generar Pagos Automáticos
        </Button>
      </div>
    </div>
  );
}
