
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SalesChannelFormData {
  name: string;
  code: string;
  is_active: boolean;
  type_channel: string;
}

interface SalesChannelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedChannel?: {
    id: string;
    name: string;
    code: string;
    is_active: boolean;
    type_channel: string;
  };
  onSuccess: () => void;
}

export function SalesChannelsDialog({
  open,
  onOpenChange,
  selectedChannel,
  onSuccess,
}: SalesChannelsDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<SalesChannelFormData>({
    name: selectedChannel?.name || "",
    code: selectedChannel?.code || "",
    is_active: selectedChannel?.is_active ?? true,
    type_channel: selectedChannel?.type_channel || "ecommerce_marketplace",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const code = formData.code.toUpperCase();

      // Si estamos editando, solo verificamos si el código ya existe si lo estamos cambiando
      if (!selectedChannel || (selectedChannel && selectedChannel.code !== code)) {
        // Verificar si el código ya existe
        const { data: existingChannel } = await supabase
          .from("sales_channels")
          .select("id")
          .eq("code", code)
          .single();

        if (existingChannel) {
          toast({
            variant: "destructive",
            title: "Error",
            description: `El código "${code}" ya está en uso. Por favor, elija otro código.`,
          });
          return;
        }
      }

      if (selectedChannel) {
        // Update existing channel
        const { error } = await supabase
          .from("sales_channels")
          .update({
            name: formData.name,
            code: code,
            is_active: formData.is_active,
            type_channel: formData.type_channel,
          })
          .eq("id", selectedChannel.id);

        if (error) throw error;
        
        toast({
          title: "Canal actualizado",
          description: "El canal de venta ha sido actualizado exitosamente.",
        });
      } else {
        // Create new channel
        const { error } = await supabase
          .from("sales_channels")
          .insert({
            name: formData.name,
            code: code,
            is_active: formData.is_active,
            type_channel: formData.type_channel,
            user_id: user!.id,
          });

        if (error) throw error;

        toast({
          title: "Canal creado",
          description: "El nuevo canal de venta ha sido creado exitosamente.",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Hubo un error al guardar el canal de venta. " + error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {selectedChannel ? "Editar Canal" : "Nuevo Canal de Venta"}
          </DialogTitle>
          <DialogDescription>
            {selectedChannel
              ? "Modifica los detalles del canal de venta"
              : "Ingresa los detalles del nuevo canal de venta"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type_channel">Tipo de Canal</Label>
            <Select
              value={formData.type_channel}
              onValueChange={(value) =>
                setFormData({ ...formData, type_channel: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo de canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="retail_own">Retail Propio</SelectItem>
                <SelectItem value="ecommerce_own">E-commerce Propio</SelectItem>
                <SelectItem value="retail_marketplace">Retail Terceros</SelectItem>
                <SelectItem value="ecommerce_marketplace">E-commerce Terceros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
            <Label htmlFor="is_active">Activo</Label>
          </div>

          <DialogFooter>
            <Button type="submit">
              {selectedChannel ? "Guardar Cambios" : "Crear Canal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
