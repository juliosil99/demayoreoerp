
import { useState } from "react";
import { useFetchPayables, PayableStatusFilter } from "./useFetchPayables";
import { AccountPayable } from "@/types/payables";

const PAGE_SIZE = 30;

export function usePaginatedPayables(statusFilter: PayableStatusFilter = "pending") {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: allPayables, isLoading } = useFetchPayables(statusFilter);

  const totalPayables = allPayables?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalPayables / PAGE_SIZE));

  // Ensure current page is valid when total pages changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // Get paginated data
  const paginatedPayables = allPayables
    ? allPayables.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
    : [];

  return {
    payables: paginatedPayables,
    isLoading,
    currentPage,
    totalPages,
    totalItems: totalPayables,
    pageSize: PAGE_SIZE,
    setPage: setCurrentPage,
  };
}
