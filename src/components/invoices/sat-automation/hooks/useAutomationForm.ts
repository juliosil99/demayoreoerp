
import React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  
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
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error("Authentication Error:", authError);
        throw new Error("Error de autenticación");
      }
      
      if (!authData.user) {
        throw new Error("Usuario no autenticado");
      }

      console.log("Creating automation job record...");
      
      // Create the automation job record
      const { data: jobData, error: jobError } = await supabase
        .from("sat_automation_jobs")
        .insert({
          rfc: data.rfc,
          start_date: format(data.startDate, "yyyy-MM-dd"),
          end_date: format(data.endDate, "yyyy-MM-dd"),
          status: "pending",
          user_id: authData.user.id
        })
        .select()
        .single();

      if (jobError) {
        console.error("Job Creation Error:", jobError);
        throw jobError;
      }

      console.log("Job created successfully, now calling edge function...");
      
      // Call the edge function to start the automation
      try {
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
          console.error("Automation Invocation Error:", automationError);
          throw automationError;
        }

        console.log("Edge function response:", automationData);
        
        if (automationData?.requiresCaptcha && automationData?.captchaSessionId) {
          console.log("CAPTCHA required, redirecting to resolver...");
          toast.info("Se requiere resolver un CAPTCHA para continuar");
          onClose();
          navigate(`/sales/invoices/captcha/${automationData.captchaSessionId}`);
          return;
        }

        toast.success("Proceso de automatización iniciado correctamente");
      } catch (functionError) {
        console.error("Function invocation error:", functionError);
        
        // Check if it's a CORS error
        if (functionError.message && functionError.message.includes("CORS")) {
          console.error("CORS error detected:", functionError);
          toast.error("Error de CORS al llamar al servicio. Por favor contacte al administrador.");
        } else {
          toast.error("Error al iniciar la automatización");
        }
        
        throw functionError;
      }

      onClose();
    } catch (error) {
      console.error("Error al iniciar la automatización:", error);
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
