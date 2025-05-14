
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface CaptchaSession {
  id: string;
  captcha_image: string;
  job_id: string;
}

interface SatAutomationJob {
  id: string;
  rfc: string;
  start_date: string;
  end_date: string;
}

export function CaptchaResolver() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [captchaSession, setCaptchaSession] = useState<CaptchaSession | null>(null);
  const [captchaSolution, setCaptchaSolution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<SatAutomationJob | null>(null);
  const [satPassword, setSatPassword] = useState("");

  useEffect(() => {
    fetchCaptchaSession();
  }, [sessionId]);

  const fetchCaptchaSession = async () => {
    if (!sessionId) return;
    
    try {
      setLoading(true);
      setError(null);

      // Get the CAPTCHA session
      const { data: captchaData, error: captchaError } = await supabase
        .from("sat_captcha_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

      if (captchaError) {
        throw captchaError;
      }

      if (!captchaData) {
        throw new Error("CAPTCHA session not found");
      }

      setCaptchaSession(captchaData as CaptchaSession);

      // Get associated job
      const { data: jobData, error: jobError } = await supabase
        .from("sat_automation_jobs")
        .select("*")
        .eq("id", captchaData.job_id)
        .single();

      if (jobError) {
        throw jobError;
      }

      setJob(jobData as SatAutomationJob);
    } catch (err: any) {
      const errorMessage = err.message || "Error loading CAPTCHA session";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaSolution.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa la solución del CAPTCHA",
        variant: "destructive"
      });
      return;
    }

    if (!satPassword.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu contraseña del SAT",
        variant: "destructive"
      });
      return;
    }

    if (!job || !captchaSession) {
      toast({
        title: "Error",
        description: "Información de sesión incompleta",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Call the refactored edge function with the new structure
      const { error } = await supabase.functions.invoke("sat-captcha", {
        body: {
          captchaSessionId: sessionId,
          captchaSolution,
          rfc: job.rfc,
          password: satPassword,
          jobId: job.id
        }
      });

      if (error) throw error;
      
      toast({
        title: "Éxito",
        description: "CAPTCHA resuelto correctamente, procesando descarga...",
      });
      
      navigate("/sales/invoices");
    } catch (err: any) {
      const errorMessage = err.message || "Error al resolver el CAPTCHA";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/sales/invoices");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 flex justify-center">
          <Button onClick={() => navigate("/sales/invoices")}>Volver a Facturas</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Resolver CAPTCHA</CardTitle>
          <CardDescription>
            Ingresa los caracteres que ves en la imagen y tu contraseña del SAT para continuar con la descarga de facturas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {captchaSession?.captcha_image && (
            <div className="mb-4 flex justify-center">
              <img 
                src={captchaSession.captcha_image} 
                alt="CAPTCHA" 
                className="border border-gray-300 rounded"
              />
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="captcha-solution" className="text-sm font-medium mb-1 block">
                Solución del CAPTCHA
              </label>
              <Input
                id="captcha-solution"
                type="text"
                placeholder="Ingresa los caracteres del CAPTCHA"
                value={captchaSolution}
                onChange={(e) => setCaptchaSolution(e.target.value)}
                autoFocus
                className="w-full"
              />
            </div>
            
            <div>
              <label htmlFor="sat-password" className="text-sm font-medium mb-1 block">
                Contraseña del SAT
              </label>
              <Input
                id="sat-password"
                type="password"
                placeholder="Ingresa tu contraseña del SAT"
                value={satPassword}
                onChange={(e) => setSatPassword(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Por tu seguridad, tu contraseña no será almacenada
              </p>
            </div>
            
            {job && (
              <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                <p>Descargando facturas del período:</p>
                <p className="font-medium">
                  {job.start_date?.split('T')[0]} a {job.end_date?.split('T')[0]}
                </p>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !captchaSolution.trim() || !satPassword.trim()}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitting ? "Procesando..." : "Enviar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
