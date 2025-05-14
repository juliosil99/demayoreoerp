import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IssuerPdfConfig } from "@/types/pdf-templates";
import { useForm } from "react-hook-form";
import { toast } from "@/components/ui/use-toast";

interface PdfTemplateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<IssuerPdfConfig>) => Promise<void>;
  template: IssuerPdfConfig | null;
}

export const PdfTemplateDialog = ({
  isOpen,
  onClose,
  onSave,
  template,
}: PdfTemplateDialogProps) => {
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<IssuerPdfConfig>({
    defaultValues: template || {
      issuer_rfc: "",
      issuer_name: "",
      address: "",
      phone: "",
      website: "",
      email: "",
    },
  });

  const onSubmit = async (data: IssuerPdfConfig) => {
    try {
      // Ensure issuer_rfc is not empty
      if (!data.issuer_rfc || data.issuer_rfc.trim() === "") {
        toast({
          title: "Error",
          description: "El RFC del emisor es obligatorio",
          variant: "destructive",
        });
        return;
      }

      // Keep the existing ID if we're editing
      const submissionData = template?.id ? { ...data, id: template.id } : data;
      
      await onSave(submissionData);
      onClose();
    } catch (error) {
      console.error("Error al guardar la plantilla:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la plantilla",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{template ? "Editar Plantilla" : "Nueva Plantilla"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="issuer_rfc">RFC Emisor*</Label>
            <Input
              id="issuer_rfc"
              {...register("issuer_rfc", { required: "El RFC es requerido" })}
              placeholder="XAXX010101000"
            />
            {errors.issuer_rfc && (
              <p className="text-sm text-red-500">{errors.issuer_rfc.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issuer_name">Nombre del Emisor</Label>
            <Input
              id="issuer_name"
              {...register("issuer_name")}
              placeholder="Nombre del Emisor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Dirección completa"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="(55) 1234-5678"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                {...register("email")}
                placeholder="contacto@empresa.com"
                type="email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Sitio Web</Label>
            <Input
              id="website"
              {...register("website")}
              placeholder="https://www.empresa.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo_url">URL del Logo</Label>
            <Input
              id="logo_url"
              {...register("logo_url")}
              placeholder="https://..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
