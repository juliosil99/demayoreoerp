
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface CaptchaSessionData {
  id: string;
  job_id: string;
  captcha_image: string;
  resolved: boolean;
}

interface JobData {
  id: string;
  rfc: string;
}

export function CaptchaResolver() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [captchaSession, setCaptchaSession] = useState<CaptchaSessionData | null>(null);
  const [job, setJob] = useState<JobData | null>(null);
  const [captchaSolution, setCaptchaSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Load captcha session data
  useEffect(() => {
    const fetchCaptchaSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase
          .from("sat_captcha_sessions")
          .select("*")
          .eq("id", sessionId)
          .single();
          
        if (sessionError) throw sessionError;
        
        if (sessionData.resolved) {
          toast.info("Este CAPTCHA ya ha sido resuelto");
          navigate("/sales/invoices");
          return;
        }
        
        setCaptchaSession(sessionData);
        
        // Get job data to get RFC
        const { data: jobData, error: jobError } = await supabase
          .from("sat_automation_jobs")
          .select("id, rfc")
          .eq("id", sessionData.job_id)
          .single();
          
        if (jobError) throw jobError;
        
        setJob(jobData);
      } catch (error) {
        console.error("Error fetching captcha session:", error);
        toast.error("Error al cargar la sesión de CAPTCHA");
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    if (sessionId) {
      fetchCaptchaSession();
    }
  }, [sessionId, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaSolution.trim()) {
      toast.error("Por favor, ingresa la solución del CAPTCHA");
      return;
    }
    
    if (!captchaSession || !job) {
      toast.error("Información de sesión no disponible");
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the edge function to continue with the captcha solution
      const { error } = await supabase.functions.invoke("sat-captcha", {
        body: {
          captchaSessionId: captchaSession.id,
          captchaSolution,
          rfc: job.rfc,
          jobId: job.id
        }
      });
      
      if (error) throw error;
      
      toast.success("CAPTCHA procesado correctamente");
      navigate("/sales/invoices");
    } catch (error) {
      console.error("Error submitting CAPTCHA solution:", error);
      toast.error("Error al procesar la solución del CAPTCHA");
    } finally {
      setLoading(false);
    }
  };
  
  if (isInitialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }
  
  if (!captchaSession) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sesión no encontrada</CardTitle>
          <CardDescription>
            La sesión de CAPTCHA solicitada no existe o ha expirado.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={() => navigate("/sales/invoices")}>
            Volver a Facturas
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Resolver CAPTCHA</CardTitle>
        <CardDescription>
          Ingresa el texto que ves en la imagen para continuar con la descarga automática.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="border rounded p-4 flex justify-center">
              <img 
                src={captchaSession.captcha_image} 
                alt="CAPTCHA" 
                className="max-h-24"
              />
            </div>
            
            <div className="space-y-2">
              <Input
                type="text"
                value={captchaSolution}
                onChange={(e) => setCaptchaSolution(e.target.value)}
                placeholder="Ingresa el texto del CAPTCHA"
                className="text-center text-lg"
                maxLength={6}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  "Enviar y continuar"
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
