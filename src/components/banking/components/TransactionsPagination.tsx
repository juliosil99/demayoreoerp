
import { useMemo } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface TransactionsPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function TransactionsPagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: TransactionsPaginationProps) {
  // Generate page numbers to display (always show first, last, and pages around current)
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      // If we have 7 or fewer pages, show all page numbers
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first, last, and pages around current
    const pageNumbers = [1];
    
    // Calculate range around current page
    let rangeStart = Math.max(2, currentPage - 1);
    let rangeEnd = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust range to always show 3 pages
    if (rangeEnd - rangeStart < 2) {
      if (rangeStart === 2) {
        rangeEnd = Math.min(4, totalPages - 1);
      } else {
        rangeStart = Math.max(2, totalPages - 3);
      }
    }
    
    // Add ellipsis if needed before range
    if (rangeStart > 2) {
      pageNumbers.push(-1); // Use -1 to represent ellipsis
    }
    
    // Add range
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i);
    }
    
    // Add ellipsis if needed after range
    if (rangeEnd < totalPages - 1) {
      pageNumbers.push(-2); // Use -2 to represent second ellipsis
    }
    
    // Add last page
    pageNumbers.push(totalPages);
    
    return pageNumbers;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <Pagination className="mt-4">
      <PaginationContent>
        {/* Previous Page Button */}
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {/* Page Numbers */}
        {pageNumbers.map((pageNumber, index) => (
          pageNumber < 0 ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(pageNumber);
                }}
                isActive={pageNumber === currentPage}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          )
        ))}
        
        {/* Next Page Button */}
        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) onPageChange(currentPage + 1);
            }}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
