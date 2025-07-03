import type { SalesTable } from "@/integrations/supabase/types/sales";

export type UnreconciledSale = SalesTable['Row'] & {
  id: number;
  date: string | null;
  Channel: string | null;
  orderNumber: string | null;
  price: number | null;
  productName: string | null;
  type?: string;
};