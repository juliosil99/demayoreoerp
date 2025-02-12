
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as z from "zod";
import type { Database } from "@/integrations/supabase/types/base";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type Profile = Database['public']['Tables']['profiles']['Row'];

const profileFormSchema = z.object({
  first_name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  last_name: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
});

const emailFormSchema = z.object({
  newEmail: z.string().email("Correo electrónico inválido"),
  password: z.string().min(6, "La contraseña es requerida"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type EmailFormValues = z.infer<typeof emailFormSchema>;

export default function Profile() {
  const { user, updateEmail } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .maybeSingle();

      if (!data && !error) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert([{ id: user?.id, email: user?.email }])
          .select()
          .single();

        if (createError) throw createError;
        return newProfile as Profile;
      }

      if (error) throw error;
      return data as Profile;
    },
  });

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
    },
    values: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
    },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      newEmail: "",
      password: "",
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const { error } = await supabase
        .from("profiles")
        .update(values)
        .eq("id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Perfil actualizado",
        description: "Tu perfil ha sido actualizado exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (error) => {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil. Por favor intenta de nuevo.",
      });
    },
  });

  const handleEmailUpdate = async (values: EmailFormValues) => {
    try {
      await updateEmail(values.newEmail, values.password);
      setIsEmailDialogOpen(false);
      emailForm.reset();
    } catch (error) {
      console.error("Error updating email:", error);
    }
  };

  async function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values);
  }

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Mi Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Tu apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <FormLabel>Correo Electrónico</FormLabel>
                <div className="flex items-center gap-4">
                  <Input 
                    value={user?.email || ''} 
                    disabled 
                    className="bg-gray-50 flex-1"
                  />
                  <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline">
                        Cambiar Email
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cambiar Correo Electrónico</DialogTitle>
                      </DialogHeader>
                      <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)} className="space-y-4">
                          <FormField
                            control={emailForm.control}
                            name="newEmail"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nuevo Correo Electrónico</FormLabel>
                                <FormControl>
                                  <Input placeholder="nuevo@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={emailForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Contraseña Actual</FormLabel>
                                <FormControl>
                                  <Input type="password" placeholder="Tu contraseña actual" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" className="w-full">
                            Actualizar Email
                          </Button>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={updateProfile.isPending}
              >
                {updateProfile.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
