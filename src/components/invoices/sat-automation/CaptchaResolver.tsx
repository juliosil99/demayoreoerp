
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function CaptchaResolver() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [captchaSession, setCaptchaSession] = useState<any>(null);
  const [captchaSolution, setCaptchaSolution] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [job, setJob] = useState<any>(null);

  useEffect(() => {
    const fetchCaptchaSession = async () => {
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

        setCaptchaSession(captchaData);

        // Get associated job
        const { data: jobData, error: jobError } = await supabase
          .from("sat_automation_jobs")
          .select("*")
          .eq("id", captchaData.job_id)
          .single();

        if (jobError) {
          throw jobError;
        }

        setJob(jobData);
      } catch (err: any) {
        setError(err.message || "Error loading CAPTCHA session");
        toast.error("Error loading CAPTCHA session");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchCaptchaSession();
    }
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!captchaSolution.trim()) {
      toast.error("Por favor ingresa la solución del CAPTCHA");
      return;
    }

    try {
      setSubmitting(true);
      
      const { error } = await supabase.functions.invoke("sat-captcha", {
        body: {
          captchaSessionId: sessionId,
          captchaSolution,
          rfc: job.rfc,
          password: "",  // Password will need to be re-entered for security
          jobId: job.id
        }
      });

      if (error) throw error;
      
      toast.success("CAPTCHA resuelto correctamente, procesando descarga...");
      navigate("/sales/invoices");
    } catch (err: any) {
      setError(err.message || "Error al resolver el CAPTCHA");
      toast.error("Error al resolver el CAPTCHA");
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
            Ingresa los caracteres que ves en la imagen para continuar con la descarga de facturas del SAT
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
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Ingresa los caracteres del CAPTCHA"
                  value={captchaSolution}
                  onChange={(e) => setCaptchaSolution(e.target.value)}
                  autoFocus
                />
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>Este CAPTCHA es requerido para continuar con la descarga de facturas del período:</p>
                <p className="font-medium">
                  {job?.start_date?.split('T')[0]} a {job?.end_date?.split('T')[0]}
                </p>
                <p className="mt-2">Para proteger tu privacidad, deberás ingresar tu contraseña del SAT nuevamente cuando resuelvas el CAPTCHA.</p>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleCancel} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={submitting || !captchaSolution.trim()}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {submitting ? "Procesando..." : "Enviar"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
