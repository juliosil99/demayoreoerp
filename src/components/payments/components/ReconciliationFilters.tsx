
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReconciliationFiltersProps {
  selectedChannel: string;
  onChannelChange: (channel: string) => void;
  orderNumbers: string;
  onOrderNumbersChange: (orderNumbers: string) => void;
}

export function ReconciliationFilters({
  selectedChannel,
  onChannelChange,
  orderNumbers,
  onOrderNumbersChange,
}: ReconciliationFiltersProps) {
  const { data: salesChannels } = useQuery({
    queryKey: ["salesChannels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_channels")
        .select("*")
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4 border p-4 rounded-md">
      <h3 className="text-lg font-semibold">Filtros</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Canal de Venta</Label>
          <Select value={selectedChannel} onValueChange={onChannelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Todos los canales" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los canales</SelectItem>
              {salesChannels?.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Números de Orden (separados por coma)</Label>
          <Input
            value={orderNumbers}
            onChange={(e) => onOrderNumbersChange(e.target.value)}
            placeholder="Ej: 1001, 1002, 1003"
          />
        </div>
      </div>
    </div>
  );
}
