
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";

interface ReconciliationFiltersProps {
  selectedChannel: string;
  onChannelChange: (value: string) => void;
  orderNumbers: string;
  onOrderNumbersChange: (value: string) => void;
}

export function ReconciliationFilters({
  selectedChannel,
  onChannelChange,
  orderNumbers,
  onOrderNumbersChange,
}: ReconciliationFiltersProps) {
  const { data: channels } = useQuery({
    queryKey: ["sales-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_channels")
        .select("*")
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Canal</Label>
          <Select
            value={selectedChannel}
            onValueChange={onChannelChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar canal" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {channels?.map((channel) => (
                <SelectItem key={channel.id} value={channel.code}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Números de Orden (uno por línea)</Label>
        <Textarea
          value={orderNumbers}
          onChange={(e) => onOrderNumbersChange(e.target.value)}
          placeholder="Ingresa los números de orden a conciliar&#10;Ejemplo:&#10;ABC123&#10;XYZ789"
          className="h-[200px] font-mono"
        />
      </div>
    </div>
  );
}
