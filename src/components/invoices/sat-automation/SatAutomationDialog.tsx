
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFields } from "./components/FormFields";
import { useAutomationForm } from "./hooks/useAutomationForm";

interface SatAutomationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SatAutomationDialog({ isOpen, onClose }: SatAutomationDialogProps) {
  const { form, isLoading, onSubmit } = useAutomationForm({ onClose });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Descarga automática de facturas del SAT</DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales del SAT para descargar facturas automáticamente.
            Tus credenciales no serán almacenadas.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={onSubmit} className="space-y-4 py-4">
            <FormFields form={form} />
            <DialogFooter>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Iniciando..." : "Iniciar descarga automática"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
