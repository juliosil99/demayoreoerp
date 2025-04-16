
import React, { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Clock, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabase";

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
        <CardTitle>Trabajos de descarga recientes</CardTitle>
        <CardDescription>
          Los últimos 5 trabajos de descarga automática del SAT
        </CardDescription>
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
                <span className="text-sm text-muted-foreground">
                  {format(new Date(job.created_at), "d 'de' MMMM, yyyy HH:mm", { locale: es })}
                </span>
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
