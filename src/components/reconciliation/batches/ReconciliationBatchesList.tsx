
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, User, Hash, FileText } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { BatchDetailsDialog } from "./BatchDetailsDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReconciliationBatch {
  id: string;
  batch_number: string;
  description: string;
  total_amount: number;
  status: string;
  created_at: string;
  notes: string;
  user_id: string;
}

export function ReconciliationBatchesList() {
  const { user } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState<ReconciliationBatch | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const { data: batches, isLoading } = useQuery({
    queryKey: ["reconciliation-batches", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reconciliation_batches')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching reconciliation batches:", error);
        throw error;
      }

      return data as ReconciliationBatch[];
    },
    enabled: !!user,
  });

  const handleViewDetails = (batch: ReconciliationBatch) => {
    setSelectedBatch(batch);
    setShowDetailsDialog(true);
  };

  if (isLoading) {
    return <div className="p-4 text-center">Cargando lotes de reconciliación...</div>;
  }

  if (!batches || batches.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500 mb-2">No se han creado lotes de reconciliación</p>
        <p className="text-sm text-gray-400">
          Los lotes aparecerán aquí cuando uses la función de "Reconciliación por Lotes"
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Número de Lote
                </div>
              </TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha
                </div>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {batches.map((batch) => (
              <TableRow key={batch.id}>
                <TableCell className="font-medium">
                  {batch.batch_number}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{batch.description || 'Sin descripción'}</p>
                    {batch.notes && (
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {batch.notes}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatCurrency(batch.total_amount)}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(batch.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={batch.status === 'active' ? 'default' : 'secondary'}
                  >
                    {batch.status === 'active' ? 'Activo' : batch.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(batch)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedBatch && (
        <BatchDetailsDialog
          open={showDetailsDialog}
          onOpenChange={setShowDetailsDialog}
          batch={selectedBatch}
        />
      )}
    </>
  );
}
