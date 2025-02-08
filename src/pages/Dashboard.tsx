
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Building } from "lucide-react";

interface Company {
  nombre: string;
  rfc: string;
  codigo_postal: string;
  regimen_fiscal: string;
}

const Dashboard = () => {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("No user found");
        }

        const { data, error } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        setCompany(data);
      } catch (error) {
        console.error("Error fetching company:", error);
        toast.error("Error al cargar datos de la empresa");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanyData();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Building className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Panel de Control</h1>
      </div>
      
      {company ? (
        <div className="grid gap-4 p-6 border rounded-lg bg-card">
          <h2 className="text-xl font-semibold">Información de la Empresa</h2>
          <div className="grid gap-2">
            <p><span className="font-medium">Nombre:</span> {company.nombre}</p>
            <p><span className="font-medium">RFC:</span> {company.rfc}</p>
            <p><span className="font-medium">Código Postal:</span> {company.codigo_postal}</p>
            <p><span className="font-medium">Régimen Fiscal:</span> {company.regimen_fiscal}</p>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground">No se encontró información de la empresa.</p>
      )}
    </div>
  );
};

export default Dashboard;
