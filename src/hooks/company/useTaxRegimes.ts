
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface TaxRegime {
  key: string;
  description: string;
}

export function useTaxRegimes() {
  const [taxRegimes, setTaxRegimes] = useState<TaxRegime[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTaxRegimes = async () => {
      try {
        const { data, error } = await supabase
          .from('tax_regimes')
          .select('key, description')
          .order('key');

        if (error) throw error;
        setTaxRegimes(data);
      } catch (error) {
        console.error("Error loading tax regimes:", error);
        toast.error("Error al cargar los regímenes fiscales");
      } finally {
        setIsLoading(false);
      }
    };

    loadTaxRegimes();
  }, []);

  return { taxRegimes, isLoading };
}
