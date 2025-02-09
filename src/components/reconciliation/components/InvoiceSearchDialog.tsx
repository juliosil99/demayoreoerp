
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface InvoiceSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedExpense: any;
  remainingAmount: number;
  selectedInvoices: any[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filteredInvoices: any[];
  onInvoiceSelect: (invoice: any) => void;
}

export function InvoiceSearchDialog({
  open,
  onOpenChange,
  selectedExpense,
  remainingAmount,
  selectedInvoices,
  searchTerm,
  onSearchChange,
  filteredInvoices,
  onInvoiceSelect
}: InvoiceSearchDialogProps) {
  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Seleccionar Facturas</h2>
        <div className="mt-2">
          <Label>Monto del Gasto: ${selectedExpense?.amount.toFixed(2)}</Label>
          {remainingAmount > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Monto restante por conciliar: ${remainingAmount.toFixed(2)}
            </p>
          )}
          {selectedInvoices.length > 0 && (
            <div className="mt-2">
              <Label>Facturas seleccionadas:</Label>
              <ul className="mt-1 space-y-1">
                {selectedInvoices.map((inv) => (
                  <li key={inv.id} className="text-sm">
                    {inv.issuer_name} - ${inv.total_amount.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <CommandInput 
        placeholder="Buscar facturas por proveedor o monto..." 
        value={searchTerm}
        onValueChange={onSearchChange}
      />
      <CommandList>
        <CommandEmpty>No se encontraron facturas.</CommandEmpty>
        <CommandGroup heading="Facturas Disponibles">
          {filteredInvoices
            .filter(invoice => !selectedInvoices.some(selected => selected.id === invoice.id))
            .map((invoice) => (
              <CommandItem
                key={invoice.id}
                onSelect={() => onInvoiceSelect(invoice)}
              >
                <div className="flex flex-col">
                  <span className="font-medium">
                    {invoice.serie 
                      ? `${invoice.serie}-${invoice.invoice_number}`
                      : invoice.invoice_number || invoice.uuid}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {invoice.issuer_name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    ${invoice.total_amount?.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(invoice.invoice_date), "dd/MM/yyyy")}
                  </span>
                </div>
              </CommandItem>
            ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
