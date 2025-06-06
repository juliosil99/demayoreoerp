
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { processChannelData, ChannelData } from "./utils";
import { SalesBase } from "@/integrations/supabase/types/sales";
import { DateRange } from "react-day-picker";
import { formatDateForQuery } from "@/utils/dateUtils";

export const useChannelDistributionData = (dateRange?: DateRange) => {
  return useQuery({
    queryKey: ["salesChannelDistribution", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      console.log('=== CHANNEL DISTRIBUTION DEBUG START ===');
      console.log('Date range input:', dateRange);
      
      let query = supabase
        .from("Sales")
        .select('Channel, price, orderNumber');
      
      // Apply date filters if provided using local timezone
      if (dateRange?.from) {
        const fromDate = formatDateForQuery(dateRange.from);
        query = query.gte('date', fromDate);
        console.log('From date filter applied:', fromDate, 'Original date:', dateRange.from);
      }
      
      if (dateRange?.to) {
        const toDate = formatDateForQuery(dateRange.to);
        query = query.lte('date', toDate);
        console.log('To date filter applied:', toDate, 'Original date:', dateRange.to);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching sales data:", error);
        throw error;
      }
      
      console.log('Raw data received from database:', data?.length || 0, 'records');
      
      // Log sample of raw data
      if (data && data.length > 0) {
        console.log('Sample of first 5 records:', data.slice(0, 5));
        
        // Log Mercado Libre specific data
        const mercadoLibreData = data.filter(item => 
          item.Channel && item.Channel.toLowerCase().includes('mercado')
        );
        console.log('Mercado Libre records found:', mercadoLibreData.length);
        console.log('Mercado Libre sample data:', mercadoLibreData.slice(0, 10));
        
        // Check for null/undefined orderNumbers in Mercado Libre data
        const mercadoLibreWithNullOrders = mercadoLibreData.filter(item => !item.orderNumber);
        console.log('Mercado Libre records with null/undefined orderNumber:', mercadoLibreWithNullOrders.length);
        
        // Get unique order numbers for Mercado Libre
        const uniqueMercadoOrders = new Set();
        mercadoLibreData.forEach(item => {
          if (item.orderNumber) {
            uniqueMercadoOrders.add(item.orderNumber);
          }
        });
        console.log('Unique Mercado Libre order numbers found:', uniqueMercadoOrders.size);
        console.log('Sample unique order numbers:', Array.from(uniqueMercadoOrders).slice(0, 10));
      }
      
      // Cast the data to partial SalesBase since we're only using Channel, price, and orderNumber
      const processedData = processChannelData(data as SalesBase[]);
      console.log('Final processed data:', processedData);
      
      // Find Mercado Libre in processed data
      const mercadoLibreProcessed = processedData.find(item => 
        item.channel.toLowerCase().includes('mercado')
      );
      if (mercadoLibreProcessed) {
        console.log('Mercado Libre final result:', mercadoLibreProcessed);
      }
      
      console.log('=== CHANNEL DISTRIBUTION DEBUG END ===');
      
      return processedData;
    }
  });
};
