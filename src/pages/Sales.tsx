
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { SalesImportDialog } from "@/components/sales/SalesImportDialog";
import { SalesHeader } from "@/components/sales/components/SalesHeader";
import { SalesTable } from "@/components/sales/components/SalesTable";
import { SalesBase } from "@/integrations/supabase/types/sales";

const ITEMS_PER_PAGE = 50;

const Sales = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNegativeProfit, setShowNegativeProfit] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const { data: sales, refetch } = useQuery({
    queryKey: ["sales", currentPage, searchTerm, showNegativeProfit],
    queryFn: async () => {
      let query = supabase
        .from("Sales")
        .select("*");

      if (searchTerm) {
        query = query.ilike("ordernumber", `%${searchTerm}%`); // Updated to lowercase field name
      }

      if (showNegativeProfit) {
        query = query.lt("profit", 0); // Updated to lowercase field name
      }

      // Create a separate query for counting total rows
      let countQuery = supabase
        .from("Sales")
        .select("*", { count: "exact", head: true });

      // Apply the same filters to the count query
      if (searchTerm) {
        countQuery = countQuery.ilike("ordernumber", `%${searchTerm}%`); // Updated to lowercase field name
      }

      if (showNegativeProfit) {
        countQuery = countQuery.lt("profit", 0); // Updated to lowercase field name
      }

      const { count, error: countError } = await countQuery;

      if (countError) {
        console.error("Error fetching count:", countError);
        throw countError;
      }

      setTotalCount(count || 0);

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;

      const { data, error } = await query
        .order("date", { ascending: false })
        .range(from, to);

      if (error) {
        console.error("Error fetching sales:", error);
        throw error;
      }

      // Cast the data to SalesBase[] to ensure type safety
      return (data || []) as SalesBase[];
    },
  });

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleNegativeProfitFilter = (enabled: boolean) => {
    setShowNegativeProfit(enabled);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      <SalesHeader 
        onImportClick={() => setImportDialogOpen(true)}
        onSearch={handleSearch}
        onNegativeProfitFilter={handleNegativeProfitFilter}
        showingNegativeProfit={showNegativeProfit}
      />
      
      <SalesImportDialog
        isOpen={importDialogOpen}
        onOpenChange={setImportDialogOpen}
        onImportSuccess={() => refetch()}
      />

      <Card>
        <CardContent className="overflow-x-auto">
          <SalesTable
            sales={sales || []}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Sales;
