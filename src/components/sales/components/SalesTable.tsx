
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { SalesBase } from "@/integrations/supabase/types/sales";
import { formatCurrency, formatCardDate } from "@/utils/formatters";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SalesTableProps {
  sales: SalesBase[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const SalesTable = ({ sales, currentPage, totalPages, onPageChange }: SalesTableProps) => {
  return (
    <div>
      <ScrollArea className="rounded-md border">
        <div className="w-full">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>No. Orden</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead className="text-right">Monto</TableHead>
                <TableHead className="text-right">Ganancia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales?.map((sale) => (
                <TableRow key={sale.id ?? `${sale.orderNumber}-${sale.date}`}>
                  <TableCell>{formatCardDate(sale.date || "")}</TableCell>
                  <TableCell>{sale.orderNumber}</TableCell>
                  <TableCell>{sale.sku || "-"}</TableCell>
                  <TableCell>{sale.productName}</TableCell>
                  <TableCell>{sale.Channel}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.price || null)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(sale.Profit || null)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => onPageChange(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
};
