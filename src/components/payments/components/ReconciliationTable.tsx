
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCardDate } from "@/utils/formatters";
import type { UnreconciledSale } from "../hooks/useBulkReconciliation";
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

const ITEMS_PER_PAGE = 30;

interface ReconciliationTableProps {
  sales?: UnreconciledSale[];
  isLoading: boolean;
}

export function ReconciliationTable({ sales, isLoading }: ReconciliationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return <div className="text-center py-4">Cargando ventas...</div>;
  }

  if (!sales?.length) {
    return (
      <div className="text-center py-4 border rounded-md">
        No hay ventas sin reconciliar que coincidan con los filtros.
      </div>
    );
  }

  const totalPages = Math.ceil(sales.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedSales = sales.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div>
      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Orden</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSales.map((sale) => {
              // Format the price based on whether it's a credit note
              const isCredit = sale.type === 'E';
              const formattedPrice = isCredit 
                ? `-$${Math.abs(sale.price || 0).toFixed(2)}` 
                : `$${sale.price?.toFixed(2) || "0.00"}`;
                
              return (
                <TableRow key={sale.id}>
                  <TableCell>
                    {sale.date ? formatCardDate(sale.date) : "-"}
                  </TableCell>
                  <TableCell>{sale.orderNumber || "-"}</TableCell>
                  <TableCell>{sale.Channel || "-"}</TableCell>
                  <TableCell>{sale.productName || "-"}</TableCell>
                  <TableCell>
                    {isCredit ? 'Nota de Crédito' : 'Factura'}
                  </TableCell>
                  <TableCell className={`text-right ${isCredit ? 'text-red-600 font-medium' : ''}`}>
                    {formattedPrice}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }).map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    onClick={() => setCurrentPage(i + 1)}
                    isActive={currentPage === i + 1}
                    className="cursor-pointer"
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
