import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useDebounce } from "@/hooks/useDebounce";
import { useState, useMemo } from "react";

const ROWS_PER_PAGE = 50;

interface ReceivablesFilters {
  searchTerm: string;
  startDate: string;
  endDate: string;
  selectedChannel: string;
  currentPage: number;
}

interface ReceivablesData {
  data: any[];
  totalCount: number;
  queryStats?: {
    totalRecords: number;
    oldestDate: string | null;
    newestDate: string | null;
    uniqueChannels: number;
    queryTime: number;
  };
}

export function useOptimizedReceivables() {
  const [filters, setFilters] = useState<ReceivablesFilters>({
    searchTerm: "",
    startDate: "",
    endDate: "",
    selectedChannel: "all",
    currentPage: 1,
  });

  // Debounce search term to reduce queries
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);

  // Create query key that includes debounced search
  const queryKey = [
    "unpaid-sales-optimized",
    debouncedSearchTerm,
    filters.startDate,
    filters.endDate,
    filters.selectedChannel,
    filters.currentPage,
  ];

  const { data, isLoading, error } = useQuery({
    queryKey,
    queryFn: async (): Promise<ReceivablesData> => {
      const startTime = performance.now();
      
      try {
        // Build the base query for count
        let countQuery = supabase
          .from("Sales")
          .select('*', { count: 'exact', head: true })
          .is('statusPaid', null);

        // Apply server-side filters for count
        if (filters.startDate) {
          countQuery = countQuery.gte('date', filters.startDate);
        }
        if (filters.endDate) {
          countQuery = countQuery.lte('date', filters.endDate);
        }
        if (filters.selectedChannel !== "all") {
          countQuery = countQuery.eq('Channel', filters.selectedChannel);
        }
        
        // Apply search filters on server side for count
        if (debouncedSearchTerm) {
          countQuery = countQuery.or(
            `orderNumber.ilike.%${debouncedSearchTerm}%,` +
            `productName.ilike.%${debouncedSearchTerm}%,` +
            `Channel.ilike.%${debouncedSearchTerm}%,` +
            `sku.ilike.%${debouncedSearchTerm}%,` +
            `date.like.%${debouncedSearchTerm}%`
          );
        }

        // Get total count
        const { count: totalCount, error: countError } = await countQuery;
        if (countError) throw countError;

        // Build data query with same filters
        let dataQuery = supabase
          .from("Sales")
          .select(`
            id,
            date,
            orderNumber,
            sku,
            productName,
            Channel,
            price
          `) // Only select needed fields to reduce egress
          .is('statusPaid', null);

        // Apply same filters to data query
        if (filters.startDate) {
          dataQuery = dataQuery.gte('date', filters.startDate);
        }
        if (filters.endDate) {
          dataQuery = dataQuery.lte('date', filters.endDate);
        }
        if (filters.selectedChannel !== "all") {
          dataQuery = dataQuery.eq('Channel', filters.selectedChannel);
        }
        
        // Apply search filters on server side for data
        if (debouncedSearchTerm) {
          dataQuery = dataQuery.or(
            `orderNumber.ilike.%${debouncedSearchTerm}%,` +
            `productName.ilike.%${debouncedSearchTerm}%,` +
            `Channel.ilike.%${debouncedSearchTerm}%,` +
            `sku.ilike.%${debouncedSearchTerm}%,` +
            `date.like.%${debouncedSearchTerm}%`
          );
        }

        // Apply pagination
        const startIndex = (filters.currentPage - 1) * ROWS_PER_PAGE;
        const endIndex = startIndex + ROWS_PER_PAGE - 1;

        const { data: salesData, error: dataError } = await dataQuery
          .order('date', { ascending: true })
          .range(startIndex, endIndex);

        if (dataError) throw dataError;

        const endTime = performance.now();
        const queryTime = endTime - startTime;

        // Generate query stats only when we have data
        let queryStats = undefined;
        if (salesData && salesData.length > 0) {
          const dates = salesData.map(sale => sale.date).filter(Boolean).sort();
          const channels = new Set(salesData.map(sale => sale.Channel).filter(Boolean));
          
          queryStats = {
            totalRecords: totalCount || 0,
            oldestDate: dates[0] || null,
            newestDate: dates[dates.length - 1] || null,
            uniqueChannels: channels.size,
            queryTime: Math.round(queryTime)
          };
        } else if (totalCount !== null) {
          queryStats = {
            totalRecords: totalCount,
            oldestDate: null,
            newestDate: null,
            uniqueChannels: 0,
            queryTime: Math.round(queryTime)
          };
        }

        return {
          data: salesData || [],
          totalCount: totalCount || 0,
          queryStats
        };
      } catch (err) {
        console.error("💥 [RECEIVABLES] Fatal query error:", err);
        throw err;
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes cache to reduce queries
  });

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil((data?.totalCount || 0) / ROWS_PER_PAGE);
    return {
      totalPages,
      hasNextPage: filters.currentPage < totalPages,
      hasPreviousPage: filters.currentPage > 1,
      totalCount: data?.totalCount || 0,
      currentPageSize: data?.data?.length || 0,
    };
  }, [data?.totalCount, data?.data?.length, filters.currentPage]);

  // Update filters functions
  const updateFilters = (newFilters: Partial<ReceivablesFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 when filters change (except page changes)
      currentPage: 'currentPage' in newFilters ? newFilters.currentPage! : 1
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      startDate: "",
      endDate: "",
      selectedChannel: "all",
      currentPage: 1,
    });
  };

  const goToPage = (page: number) => {
    setFilters(prev => ({ ...prev, currentPage: page }));
  };

  const nextPage = () => {
    if (paginationInfo.hasNextPage) {
      goToPage(filters.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (paginationInfo.hasPreviousPage) {
      goToPage(filters.currentPage - 1);
    }
  };

  return {
    // Data
    sales: data?.data || [],
    queryStats: data?.queryStats,
    
    // State
    filters,
    isLoading,
    error,
    
    // Pagination
    paginationInfo,
    
    // Actions
    updateFilters,
    clearFilters,
    goToPage,
    nextPage,
    previousPage,
  };
}