
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { SalesChannelsDialog } from "@/components/sales-channels/SalesChannelsDialog";
import { PlusIcon, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function SalesChannels() {
  const [open, setOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<{
    id: string;
    name: string;
    code: string;
    is_active: boolean;
  } | undefined>();

  const { data: channels, refetch } = useQuery({
    queryKey: ["sales-channels"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_channels")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  const handleEdit = (channel: typeof selectedChannel) => {
    setSelectedChannel(channel);
    setOpen(true);
  };

  const handleAddNew = () => {
    setSelectedChannel(undefined);
    setOpen(true);
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Settings2 className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Canales de Venta</h1>
        </div>
        <Button onClick={handleAddNew}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Canal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Canales Configurados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {channels?.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell>{channel.name}</TableCell>
                  <TableCell>{channel.code}</TableCell>
                  <TableCell>
                    <Badge variant={channel.is_active ? "default" : "secondary"}>
                      {channel.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(channel)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <SalesChannelsDialog
        open={open}
        onOpenChange={setOpen}
        selectedChannel={selectedChannel}
        onSuccess={refetch}
      />
    </div>
  );
}
