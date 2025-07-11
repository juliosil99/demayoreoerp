
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
import { Pencil, Download, FileText, Receipt } from "lucide-react";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { downloadTransferInvoice } from "./utils/transferInvoiceUtils";
import { supabase } from "@/lib/supabase";

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
  company_id: string;
  selected_invoice_id: number | null;
  from_account?: { name: string };
  to_account?: { name: string };
  selected_invoice?: {
    id: number;
    invoice_number: string | null;
    issuer_name: string | null;
    total_amount: number | null;
    uuid: string | null;
    filename: string;
    file_path: string;
  };
  created_at?: string;
  invoice_file_path?: string;
  invoice_filename?: string;
  invoice_content_type?: string;
  invoice_size?: number;
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
                  <TableHead className="text-center">Comprobante</TableHead>
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
                    <TableCell className="text-center">
                      {transfer.invoice_file_path ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => downloadTransferInvoice(transfer.invoice_file_path!)}
                            title={`Descargar ${transfer.invoice_filename}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : transfer.selected_invoice ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Receipt className="h-4 w-4 text-blue-600" />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              const { data } = supabase.storage
                                .from('invoices')
                                .getPublicUrl(transfer.selected_invoice!.file_path);
                              window.open(data.publicUrl, '_blank');
                            }}
                            title={`Ver factura ${transfer.selected_invoice.invoice_number || transfer.selected_invoice.issuer_name}`}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {transfer.selected_invoice.invoice_number || transfer.selected_invoice.issuer_name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin comprobante</span>
                      )}
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
