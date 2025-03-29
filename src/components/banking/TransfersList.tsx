
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";

// Define the TransferRow interface directly
interface TransferRow {
  id: string;
  date: string;
  from_account_id: number;
  to_account_id: number;
  amount_from: number;
  amount_to: number;
  reference_number: string | null;
  notes: string | null;
  user_id: string;
  status: string;
  from_account?: { name: string };
  to_account?: { name: string };
  created_at?: string;
  // For backward compatibility
  amount?: number;
}

interface TransfersListProps {
  transfers: TransferRow[] | null;
  isLoading: boolean;
  onEditTransfer: (transfer: TransferRow) => void;
}

export function TransfersList({ transfers, isLoading, onEditTransfer }: TransfersListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transferencias Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Cargando transferencias...</div>
        ) : transfers && transfers.length > 0 ? (
          <div className="max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>A</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>{formatDate(transfer.date)}</TableCell>
                    <TableCell>{transfer.from_account?.name}</TableCell>
                    <TableCell>{transfer.to_account?.name}</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(transfer.amount_from || transfer.amount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => onEditTransfer(transfer)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-4">No hay transferencias recientes</div>
        )}
      </CardContent>
    </Card>
  );
}
