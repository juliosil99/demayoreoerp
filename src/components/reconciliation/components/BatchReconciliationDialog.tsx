
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Plus, Calculator } from "lucide-react";
import { formatCurrency } from "@/utils/formatters";
import { useBatchReconciliation } from "../hooks/useBatchReconciliation";
import { ExpenseSelector } from "./batch/ExpenseSelector";
import { InvoiceSelector } from "./batch/InvoiceSelector";

interface BatchReconciliationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BatchReconciliationDialog({ 
  open, 
  onOpenChange,
  onSuccess 
}: BatchReconciliationDialogProps) {
  const {
    selectedItems,
    removeItem,
    description,
    setDescription,
    notes,
    setNotes,
    calculateTotal,
    isBalanced,
    createBatch,
    resetBatch,
    isCreating,
    addItem
  } = useBatchReconciliation();

  const handleCreateBatch = async () => {
    const result = await createBatch();
    if (result) {
      onSuccess?.();
      onOpenChange(false);
    }
  };

  const total = calculateTotal();
  const balanced = isBalanced();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Reconciliación por Lotes
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Información del lote */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Descripción del Lote</label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Anticipo y facturas Q4 2024"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notas</label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas adicionales (opcional)"
              />
            </div>
          </div>

          {/* Resumen del balance */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">Items seleccionados: {selectedItems.length}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedItems.filter(i => i.type === 'expense').length} gastos, {' '}
                  {selectedItems.filter(i => i.type === 'invoice').length} facturas
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${balanced ? 'text-green-600' : 'text-amber-600'}`}>
                  Total: {formatCurrency(total)}
                </p>
                <Badge variant={balanced ? "default" : "destructive"} className="text-xs">
                  {balanced ? 'Balanceado ✓' : 'Desbalanceado'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Items seleccionados */}
          {selectedItems.length > 0 && (
            <div className="border rounded-lg">
              <div className="p-3 border-b bg-muted/30">
                <h4 className="font-medium">Items en el Lote</h4>
              </div>
              <ScrollArea className="h-48">
                <div className="p-3 space-y-2">
                  {selectedItems.map((item, index) => (
                    <div key={`${item.type}-${item.id}-${index}`} 
                         className="flex justify-between items-center p-2 bg-background rounded border">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={item.type === 'expense' ? 'default' : 'secondary'}>
                            {item.type === 'expense' ? 'Gasto' : 'Factura'}
                          </Badge>
                          <span className="font-medium text-sm">{item.description}</span>
                        </div>
                        {item.supplier && (
                          <p className="text-xs text-muted-foreground mt-1">{item.supplier}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatCurrency(item.amount)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id, item.type)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Selectores de gastos y facturas */}
          <Tabs defaultValue="expenses" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="expenses">Agregar Gastos</TabsTrigger>
              <TabsTrigger value="invoices">Agregar Facturas</TabsTrigger>
            </TabsList>
            
            <TabsContent value="expenses" className="flex-1 overflow-hidden">
              <ExpenseSelector onAddItem={addItem} selectedItems={selectedItems} />
            </TabsContent>
            
            <TabsContent value="invoices" className="flex-1 overflow-hidden">
              <InvoiceSelector onAddItem={addItem} selectedItems={selectedItems} />
            </TabsContent>
          </Tabs>

          {/* Acciones */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetBatch}
                disabled={selectedItems.length === 0}
              >
                Limpiar Todo
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateBatch}
                disabled={!balanced || selectedItems.length === 0 || isCreating}
              >
                {isCreating ? "Creando..." : "Crear Lote"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
