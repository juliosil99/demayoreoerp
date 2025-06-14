import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, RefreshCw, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";
import { toast } from "@/components/ui/use-toast";

interface SatJob {
  id: string;
  rfc: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'in_progress' | 'captcha_required' | 'resuming' | 'completed' | 'failed';
  total_files: number;
  downloaded_files: number;
  error_message: string | null;
  created_at: string;
}

export function SatJobsList() {
  const [jobs, setJobs] = useState<SatJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingJobs, setDeletingJobs] = useState<Set<string>>(new Set());

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("sat_automation_jobs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        throw error;
      }

      setJobs(data as SatJob[]);
    } catch (error) {
      console.error("Error fetching SAT jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteJob = async (jobId: string) => {
    try {
      setDeletingJobs(prev => new Set([...prev, jobId]));
      
      const { error } = await supabase
        .from("sat_automation_jobs")
        .delete()
        .eq("id", jobId);

      if (error) {
        throw error;
      }

      setJobs(prev => prev.filter(job => job.id !== jobId));
      
      toast({
        title: "Trabajo eliminado",
        description: "El trabajo de descarga ha sido eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el trabajo. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setDeletingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  const clearAllJobs = async () => {
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error("Usuario no autenticado");
      }

      // Delete all jobs for the current user
      const { error } = await supabase
        .from("sat_automation_jobs")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setJobs([]);
      
      toast({
        title: "Trabajos eliminados",
        description: "Todos los trabajos de descarga han sido eliminados.",
      });
    } catch (error) {
      console.error("Error clearing all jobs:", error);
      toast({
        title: "Error",
        description: "No se pudieron eliminar todos los trabajos. Intenta de nuevo.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchJobs();

    // Set up real-time subscription
    const channel = supabase
      .channel('public:sat_automation_jobs')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'sat_automation_jobs' 
      }, fetchJobs)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusIcon = (status: SatJob['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
      case 'resuming':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  const getStatusText = (status: SatJob['status']) => {
    switch (status) {
      case 'pending': return "Pendiente";
      case 'in_progress': return "En progreso";
      case 'captcha_required': return "CAPTCHA requerido";
      case 'resuming': return "Reanudando";
      case 'completed': return "Completado";
      case 'failed': return "Fallido";
      default: return status;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trabajos de descarga recientes</CardTitle>
          <CardDescription>Cargando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trabajos de descarga recientes</CardTitle>
            <CardDescription>
              Los últimos 5 trabajos de descarga automática del SAT
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllJobs}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpiar todo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {jobs.map((job) => (
            <div key={job.id} className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(job.status)}
                  <span className="font-medium">
                    {getStatusText(job.status)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(job.created_at), "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteJob(job.id)}
                    disabled={deletingJobs.has(job.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    {deletingJobs.has(job.id) ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="text-sm mb-2">
                <span className="text-muted-foreground">Periodo:</span>{" "}
                {format(new Date(job.start_date), "dd/MM/yyyy")} - {format(new Date(job.end_date), "dd/MM/yyyy")}
              </div>
              
              {job.status === 'in_progress' && job.total_files > 0 && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Descargando facturas</span>
                    <span>
                      {job.downloaded_files} de {job.total_files}
                    </span>
                  </div>
                  <Progress 
                    value={(job.downloaded_files / job.total_files) * 100} 
                  />
                </div>
              )}
              
              {job.status === 'completed' && job.total_files > 0 && (
                <div className="text-sm text-green-600">
                  {job.downloaded_files} facturas descargadas correctamente
                </div>
              )}
              
              {job.error_message && (
                <div className="text-sm text-red-500 mt-2">
                  Error: {job.error_message}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
