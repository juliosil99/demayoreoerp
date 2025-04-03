
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface ForecastItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ForecastItem>) => void;
  selectedWeek?: ForecastWeek;
  item?: ForecastItem;
}

const itemSchema = z.object({
  category: z.string().min(1, "La categoría es requerida"),
  description: z.string().optional(),
  amount: z.coerce.number().positive("El monto debe ser mayor que cero"),
  type: z.enum(['inflow', 'outflow']),
  source: z.enum(['historical', 'ai_predicted', 'manual', 'recurring']),
  is_recurring: z.boolean().default(false),
});

type ItemFormValues = z.infer<typeof itemSchema>;

export function ForecastItemDialog({
  isOpen,
  onClose,
  onSave,
  selectedWeek,
  item
}: ForecastItemDialogProps) {
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: item ? {
      category: item.category,
      description: item.description || '',
      amount: item.amount,
      type: item.type,
      source: item.source,
      is_recurring: item.is_recurring || false,
    } : {
      category: '',
      description: '',
      amount: 0,
      type: 'inflow',
      source: 'manual',
      is_recurring: false,
    }
  });

  const handleSubmit = (values: ItemFormValues) => {
    if (!selectedWeek) return;
    
    onSave({
      id: item?.id,
      week_id: selectedWeek.id,
      category: values.category,
      description: values.description,
      amount: values.amount,
      type: values.type,
      source: values.source,
      is_recurring: values.is_recurring
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Editar Elemento del Pronóstico' : 'Agregar Elemento del Pronóstico'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione el tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="inflow">Entrada de Efectivo</SelectItem>
                      <SelectItem value="outflow">Salida de Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoría</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Ej. Ventas, Nómina, Renta..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      min="0" 
                      {...field} 
                      placeholder="0.00" 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (Opcional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      placeholder="Descripción detallada del elemento..." 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="source"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origen</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione el origen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="manual">Manual</SelectItem>
                        <SelectItem value="historical">Histórico</SelectItem>
                        <SelectItem value="ai_predicted">Predicción IA</SelectItem>
                        <SelectItem value="recurring">Recurrente</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="is_recurring"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Recurrente</FormLabel>
                    <div className="flex items-center space-x-2 h-10">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <span className="text-sm text-muted-foreground">
                        {field.value ? 'Sí' : 'No'}
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">
                {item ? 'Actualizar' : 'Agregar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
