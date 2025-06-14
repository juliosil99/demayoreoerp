import { supabase } from "@/integrations/supabase/client";

interface InvoiceData {
  id: number;
  invoice_number?: string | null;
  serie?: string | null;
  invoice_date?: string | null;
  stamp_date?: string | null;
  issuer_name?: string | null;
  issuer_rfc?: string | null;
  issuer_tax_regime?: string | null;
  receiver_name?: string | null;
  receiver_rfc?: string | null;
  receiver_tax_regime?: string | null;
  receiver_cfdi_use?: string | null;
  uuid?: string | null;
  subtotal?: number | null;
  tax_amount?: number | null;
  total_amount?: number | null;
  currency?: string | null;
  exchange_rate?: number | null;
  payment_method?: string | null;
  payment_form?: string | null;
  invoice_type?: string | null;
  certificate_number?: string | null;
  sat_certificate_number?: string | null;
  cfdi_stamp?: string | null;
  sat_stamp?: string | null;
}

interface ProductData {
  quantity?: number | null;
  description?: string | null;
  unit_value?: number | null;
  amount?: number | null;
  unit?: string | null;
  product_key?: string | null;
  unit_key?: string | null;
}

interface PdfTemplate {
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
}

interface EntityData {
  name?: string | null;
  address?: string | null;
  postal_code?: string | null;
  phone?: string | null;
  tax_regime?: string | null;
}

/**
 * Fetches invoice data from the database
 */
export const fetchInvoiceData = async (invoiceId: number): Promise<InvoiceData | null> => {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching invoice:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!data) {
      throw new Error("No invoice found with the provided ID");
    }

    console.log("Invoice data fetched successfully");
    return data;
  } catch (err) {
    console.error("Error in fetchInvoiceData:", err);
    throw err;
  }
};

/**
 * Fetches products for an invoice from the database
 */
export const fetchInvoiceProducts = async (invoiceId: number): Promise<ProductData[]> => {
  try {
    const { data, error } = await supabase
      .from("invoice_products")
      .select("*")
      .eq("invoice_id", invoiceId);

    if (error) {
      console.error("Error fetching products:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    console.log(`Fetched ${data?.length || 0} products for invoice`);
    return data || [];
  } catch (err) {
    console.error("Error in fetchInvoiceProducts:", err);
    return []; // Return empty array as fallback
  }
};

/**
 * Fetches issuer contact data from the 'contacts' table
 */
export const fetchIssuerContactData = async (issuerRfc: string): Promise<EntityData | null> => {
  if (!issuerRfc) {
    console.log("No issuer RFC provided, skipping contact data fetch");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("name, address, postal_code, phone, tax_regime")
      .eq("rfc", issuerRfc)
      .maybeSingle();

    if (error) {
      console.error("Error fetching issuer contact data:", error);
      return null;
    }

    if (data) {
      console.log("Issuer contact data fetched successfully for RFC:", issuerRfc);
    } else {
      console.log("No contact data found for issuer RFC:", issuerRfc);
    }
    
    return data;
  } catch (err) {
    console.error("Error in fetchIssuerContactData:", err);
    return null;
  }
};

/**
 * Fetches company data from the 'companies' table for a given RFC.
 * This is used to get details for our own company when we are the receiver.
 */
export const fetchReceiverCompanyData = async (receiverRfc: string): Promise<EntityData | null> => {
  if (!receiverRfc) {
    console.log("No receiver RFC provided, skipping company data fetch");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("companies")
      .select("name:nombre, address:direccion, postal_code:codigo_postal, phone:telefono, tax_regime:regimen_fiscal")
      .eq("rfc", receiverRfc)
      .maybeSingle();

    if (error) {
      console.error("Error fetching receiver company data:", error);
      return null;
    }

    if (data) {
      console.log("Receiver company data fetched successfully for RFC:", receiverRfc);
    } else {
      console.log("No company data found for receiver RFC:", receiverRfc);
    }
    
    return data;
  } catch (err) {
    console.error("Error in fetchReceiverCompanyData:", err);
    return null;
  }
};

/**
 * Fetches contact data for a receiver from the 'contacts' table.
 */
export const fetchReceiverContactData = async (receiverRfc: string): Promise<EntityData | null> => {
  if (!receiverRfc) {
    console.log("No receiver RFC provided, skipping receiver contact data fetch");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("contacts")
      .select("name, address, postal_code, phone, tax_regime")
      .eq("rfc", receiverRfc)
      .maybeSingle();

    if (error) {
      console.error("Error fetching receiver contact data:", error);
      return null;
    }

    if (data) {
      console.log("Receiver contact data fetched successfully for RFC:", receiverRfc);
    } else {
      console.log("No contact data found for receiver RFC:", receiverRfc);
    }

    return data;
  } catch (err) {
    console.error("Error in fetchReceiverContactData:", err);
    return null;
  }
};

/**
 * Fetches PDF template configuration for an issuer
 */
export const fetchTemplateConfig = async (issuerRfc: string): Promise<PdfTemplate | null> => {
  try {
    if (!issuerRfc) {
      console.log("No issuer RFC provided, skipping template fetch");
      return null;
    }

    const { data, error } = await supabase
      .from("issuer_pdf_configs")
      .select("*")
      .eq("issuer_rfc", issuerRfc)
      .maybeSingle();
    
    if (!error && data) {
      console.log("Found custom template for RFC:", issuerRfc);
      return data;
    }
    
    console.log("No custom template found for RFC, using default template");
    return null;
  } catch (err) {
    console.log("Error fetching template, continuing with default:", err);
    return null;
  }
};

export type { InvoiceData, ProductData, PdfTemplate, EntityData };
