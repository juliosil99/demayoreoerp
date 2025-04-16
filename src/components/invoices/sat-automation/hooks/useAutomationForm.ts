
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
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

export type AutomationFormValues = z.infer<typeof automationFormSchema>;

export function useAutomationForm({ onClose }: { onClose: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<AutomationFormValues>({
    resolver: zodResolver(automationFormSchema),
    defaultValues: {
      rfc: "",
      password: "",
      startDate: new Date(new Date().setDate(1)), // First day of current month
      endDate: new Date(),
    },
  });

  const onSubmit = async (data: AutomationFormValues) => {
    setIsLoading(true);
    try {
      // Get current user to use for user_id
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error("User not authenticated");
      }

      // Create the automation job record
      const { data: jobData, error: jobError } = await supabase
        .from("sat_automation_jobs")
        .insert({
          rfc: data.rfc,
          start_date: format(data.startDate, "yyyy-MM-dd"),
          end_date: format(data.endDate, "yyyy-MM-dd"),
          status: "pending",
          user_id: authData.user.id  // Add the user_id from auth data
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
        toast.info("Se requiere resolver un CAPTCHA para continuar");
        onClose();
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
  };

  return {
    form,
    isLoading,
    onSubmit: form.handleSubmit(onSubmit),
  };
}
