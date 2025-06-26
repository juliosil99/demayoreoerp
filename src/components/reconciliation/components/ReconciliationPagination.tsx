
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ReconciliationPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function ReconciliationPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  isLoading = false
}: ReconciliationPaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  const hasNext = currentPage < totalPages;
  const hasPrev = currentPage > 1;

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-2 sm:px-0">
      <div className="text-sm text-muted-foreground">
        Mostrando {Math.min((currentPage - 1) * pageSize + 1, totalItems)} - {Math.min(currentPage * pageSize, totalItems)} de {totalItems} gastos
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrev || isLoading}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        
        <div className="flex items-center space-x-1">
          {/* Mostrar páginas cercanas */}
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + i;
            } else {
              pageNumber = currentPage - 2 + i;
            }
            
            return (
              <Button
                key={pageNumber}
                variant={pageNumber === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                disabled={isLoading}
                className="w-10"
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext || isLoading}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
