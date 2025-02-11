
import { useForm } from "react-hook-form";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useTaxRegimes } from "@/hooks/company/useTaxRegimes";

type CompanyFormData = {
  nombre: string;
  rfc: string;
  codigo_postal: string;
  regimen_fiscal: string;
};

interface CompanyFormProps {
  defaultValues?: CompanyFormData;
  isEditing: boolean;
  userId: string;
  onSubmitSuccess?: () => void;
}

export function CompanyForm({ defaultValues, isEditing, userId, onSubmitSuccess }: CompanyFormProps) {
  const navigate = useNavigate();
  const { taxRegimes } = useTaxRegimes();
  const [isLoading, setIsLoading] = useState(false);
  
  const form = useForm<CompanyFormData>({
    defaultValues: defaultValues || {
      nombre: "",
      rfc: "",
      codigo_postal: "",
      regimen_fiscal: "",
    },
  });

  const onSubmit = async (data: CompanyFormData) => {
    setIsLoading(true);
    try {
      if (isEditing) {
        const { error } = await supabase
          .from("companies")
          .update(data)
          .eq("user_id", userId);

        if (error) throw error;
        toast.success("¡Información actualizada exitosamente!");
      } else {
        const { error } = await supabase
          .from("companies")
          .insert([{
            ...data,
            user_id: userId,
          }]);

        if (error) throw error;
        toast.success("¡Empresa registrada exitosamente!");
      }
      onSubmitSuccess?.();
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al guardar la información");
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un régimen fiscal" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {taxRegimes.map((regime) => (
                    <SelectItem key={regime.key} value={regime.key}>
                      {regime.key} - {regime.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
  );
}
