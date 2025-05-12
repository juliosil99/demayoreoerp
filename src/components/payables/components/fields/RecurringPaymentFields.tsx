
import React, { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PayableFormData } from "../../types/payableTypes";
import { Button } from "@/components/ui/button";

interface RecurringPaymentFieldsProps {
  form: UseFormReturn<PayableFormData>;
}

export function RecurringPaymentFields({ form }: RecurringPaymentFieldsProps) {
  const isRecurring = form.watch("is_recurring");
  const recurrencePattern = form.watch("recurrence_pattern");
  const dueDate = form.watch("due_date");

  // Set default recurrence_day based on the due_date when the pattern changes
  useEffect(() => {
    if (isRecurring && dueDate && recurrencePattern === "monthly") {
      form.setValue("recurrence_day", dueDate.getDate());
    }
  }, [recurrencePattern, isRecurring, dueDate, form]);

  return (
    <>
      <div className="flex items-center space-x-2 mb-4">
        <Checkbox 
          id="is_recurring" 
          checked={isRecurring}
          onCheckedChange={(checked) => {
            form.setValue("is_recurring", !!checked);
            if (!checked) {
              form.setValue("recurrence_pattern", null);
              form.setValue("recurrence_day", null);
              form.setValue("recurrence_end_date", null);
            }
          }}
        />
        <label
          htmlFor="is_recurring"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Pago Recurrente
        </label>
      </div>

      {isRecurring && (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="recurrence_pattern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patrón de Recurrencia</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value || undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Mensual</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {recurrencePattern === "monthly" && (
            <FormField
              control={form.control}
              name="recurrence_day"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Día del Mes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={31}
                      {...field}
                      onChange={e => field.onChange(Number(e.target.value))}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="recurrence_end_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Fecha de Finalización</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Seleccionar fecha</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={(date) => {
                        if (date) {
                          // Create a date object at mid-day to avoid timezone issues
                          const year = date.getFullYear();
                          const month = date.getMonth();
                          const day = date.getDate();
                          
                          // Create new date with time set to noon to avoid timezone issues
                          const selectedDate = new Date(year, month, day, 12, 0, 0);
                          field.onChange(selectedDate);
                        }
                      }}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </>
  );
}
