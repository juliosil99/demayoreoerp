
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";

import { supabase } from "@/lib/supabase";

const automationFormSchema = z.object({
  rfc: z.string().min(12, "RFC debe tener al menos 12 caracteres").max(13),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  startDate: z.date({
    required_error: "Fecha inicial es requerida",
  }),
  endDate: z.date({
    required_error: "Fecha final es requerida",
  }),
});

type AutomationFormValues = z.infer<typeof automationFormSchema>;

interface SatAutomationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SatAutomationDialog({ isOpen, onClose }: SatAutomationDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  
  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(automationFormSchema),
    defaultValues: {
      rfc: "",
      password: "",
      startDate: new Date(new Date().setDate(1)), // First day of current month
      endDate: new Date(),
    },
  });

  async function onSubmit(data: AutomationFormValues) {
    setIsLoading(true);
    try {
      // Create the automation job record
      const { data: jobData, error: jobError } = await supabase
        .from("sat_automation_jobs")
        .insert({
          rfc: data.rfc,
          start_date: format(data.startDate, "yyyy-MM-dd"),
          end_date: format(data.endDate, "yyyy-MM-dd"),
          status: "pending",
          // We don't need to explicitly add user_id as RLS will add it automatically via the auth.uid() function
        })
        .select()
        .single();

      if (jobError) {
        throw jobError;
      }

      // Call the edge function to start the automation
      const { data: automationData, error: automationError } = await supabase.functions.invoke(
        "sat-automation",
        {
          body: {
            rfc: data.rfc,
            password: data.password,
            startDate: format(data.startDate, "yyyy-MM-dd"),
            endDate: format(data.endDate, "yyyy-MM-dd"),
            jobId: jobData.id,
          },
        }
      );

      if (automationError) {
        throw automationError;
      }

      if (automationData.requiresCaptcha) {
        // Redirect to CAPTCHA resolution
        toast.info("Se requiere resolver un CAPTCHA para continuar");
        onClose();
        // We would typically navigate to a CAPTCHA resolution page here
        return;
      }

      toast.success("Proceso de automatización iniciado correctamente");
      onClose();
    } catch (error) {
      console.error("Error starting automation:", error);
      toast.error("Error al iniciar la automatización");
    } finally {
      setIsLoading(false);
    }
  }

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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="rfc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RFC</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu RFC" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Contraseña del SAT" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha inicial</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Seleccionar</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2000-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha final</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Seleccionar</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("2000-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
