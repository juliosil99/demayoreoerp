
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ForecastItem, ForecastWeek } from "@/types/cashFlow";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, ItemFormValues } from "./forecast-item/types";
import { ItemForm } from "./forecast-item/ItemForm";

interface ForecastItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<ForecastItem>) => Promise<boolean>;
  week: ForecastWeek;
  item?: ForecastItem;
}

export function ForecastItemDialog({
  isOpen,
  onClose,
  onSave,
  week,
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
    onSave({
      id: item?.id,
      week_id: week.id,
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
        
        <ItemForm 
          form={form}
          onSubmit={handleSubmit}
          onCancel={onClose}
          isEditing={!!item}
        />
      </DialogContent>
    </Dialog>
  );
}
