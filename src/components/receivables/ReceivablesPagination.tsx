import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationInfo {
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  currentPageSize: number;
}

interface ReceivablesPaginationProps {
  currentPage: number;
  paginationInfo: PaginationInfo;
  onPageChange: (page: number) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}

export function ReceivablesPagination({
  currentPage,
  paginationInfo,
  onPageChange,
  onPreviousPage,
  onNextPage,
}: ReceivablesPaginationProps) {
  const { totalPages, hasNextPage, hasPreviousPage, totalCount, currentPageSize } = paginationInfo;

  if (totalPages <= 1) {
    return null;
  }

  // Calculate visible page range
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = Math.max(2, currentPage - delta);
         i <= Math.min(totalPages - 1, currentPage + delta);
         i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="text-sm text-muted-foreground text-center">
        Mostrando {currentPageSize} de {totalCount} ventas pendientes
        {totalPages > 1 && (
          <span> - Página {currentPage} de {totalPages}</span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center">
        <Pagination>
          <PaginationContent>
            {/* Previous Button */}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={onPreviousPage}
                disabled={!hasPreviousPage}
                className="gap-1 pl-2.5"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
            </PaginationItem>

            {/* Page Numbers */}
            {visiblePages.map((page, index) => (
              <PaginationItem key={index}>
                {page === '...' ? (
                  <span className="flex h-9 w-9 items-center justify-center">
                    <span className="text-muted-foreground">…</span>
                  </span>
                ) : (
                  <PaginationLink
                    onClick={() => onPageChange(page as number)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            {/* Next Button */}
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                onClick={onNextPage}
                disabled={!hasNextPage}
                className="gap-1 pr-2.5"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}