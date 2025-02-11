
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Building, Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type CompanyFormData = {
  nombre: string;
  rfc: string;
  codigo_postal: string;
  regimen_fiscal: string;
};

export default function CompanySetup() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const form = useForm<CompanyFormData>({
    defaultValues: {
      nombre: "",
      rfc: "",
      codigo_postal: "",
      regimen_fiscal: "",
    },
  });

  useEffect(() => {
    const loadCompanyData = async () => {
      if (!user) {
        navigate("/login");
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("companies")
          .select()
          .eq("user_id", user.id)
          .single();

        if (error) {
          if (error.code !== 'PGRST116') { // Si no es error de "no data", mostramos el error
            console.error("Error checking company:", error);
            toast.error("Error al verificar la empresa");
          }
          // Si no hay datos y no estamos editando, dejamos continuar para crear nueva empresa
          return;
        }
        
        // Si encontramos datos y venimos del dashboard (edición)
        if (data && window.location.search.includes('edit=true')) {
          setIsEditing(true);
          form.reset({
            nombre: data.nombre,
            rfc: data.rfc,
            codigo_postal: data.codigo_postal,
            regimen_fiscal: data.regimen_fiscal,
          });
        } else if (data && !window.location.search.includes('edit=true')) {
          // Si hay datos pero no estamos editando, redirigimos al dashboard
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error checking company:", error);
        toast.error("Error al verificar la empresa");
      }
    };

    loadCompanyData();
  }, [user, navigate, form]);

  const onSubmit = async (data: CompanyFormData) => {
    if (!user) {
      toast.error("Debes iniciar sesión para continuar");
      navigate("/login");
      return;
    }
    
    setIsLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("companies")
          .update(data)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("¡Información actualizada exitosamente!");
      } else {
        const { error } = await supabase
          .from("companies")
          .insert([{
            ...data,
            user_id: user.id,
          }]);

        if (error) throw error;
        toast.success("¡Empresa registrada exitosamente!");
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar la información");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle className="text-2xl">
              {isEditing ? "Editar Información de Empresa" : "Configuración de Empresa"}
            </CardTitle>
          </div>
          <CardDescription>
            {isEditing 
              ? "Actualiza la información de tu empresa"
              : "Ingresa la información de tu empresa para comenzar"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre de la Empresa</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="rfc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RFC</FormLabel>
                    <FormControl>
                      <Input placeholder="RFC" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="codigo_postal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Postal</FormLabel>
                    <FormControl>
                      <Input placeholder="Código Postal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="regimen_fiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Régimen Fiscal</FormLabel>
                    <FormControl>
                      <Input placeholder="Régimen Fiscal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  "Guardando..."
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? "Guardar Cambios" : "Guardar Información"}
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
