
import { supabase } from "@/integrations/supabase/client";
import { parseXMLContent } from "./xml-parser";
import { CFDIParseResult } from "@/types/invoice-types";

const checkDuplicateUUID = async (uuid: string | null) => {
  console.log(`🔍 Checking for duplicate UUID: ${uuid}`);
  
  if (!uuid) {
    console.log("⚠️ No UUID provided for duplicate check");
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("id")
      .eq("uuid", uuid)
      .maybeSingle();

    if (error) {
      console.error("❌ Error checking for duplicate UUID:", error);
      return false;
    }

    const isDuplicate = !!data;
    console.log(`🔍 Duplicate check result for UUID ${uuid}: ${isDuplicate ? 'DUPLICATE' : 'UNIQUE'}`);
    return isDuplicate;
  } catch (error) {
    console.error("❌ Exception during duplicate UUID check:", error);
    return false;
  }
};

export const processInvoiceFile = async (file: File, xmlContent: string) => {
  console.log(`🔄 Starting invoice processing for file: ${file.name}`);
  
  try {
    console.log(`📋 Parsing XML content for file: ${file.name}`);
    const cfdiData: CFDIParseResult = parseXMLContent(xmlContent);
    
    console.log(`📋 XML parsing result for ${file.name}:`, {
      hasError: cfdiData.error,
      errorMessage: cfdiData.errorMessage,
      uuid: cfdiData.uuid,
      invoiceNumber: cfdiData.invoice_number,
      totalAmount: cfdiData.total_amount,
      issuerRfc: cfdiData.issuer_rfc,
      receiverRfc: cfdiData.receiver_rfc
    });
    
    // Check if there was an error in parsing
    if (cfdiData.error) {
      console.error(`❌ XML parsing failed for ${file.name}:`, cfdiData.errorMessage);
      return { success: false, isDuplicate: false, error: cfdiData.errorMessage };
    }
    
    console.log(`🔍 Starting duplicate check for ${file.name} with UUID: ${cfdiData.uuid}`);
    const isDuplicate = await checkDuplicateUUID(cfdiData.uuid);
    
    if (isDuplicate) {
      console.log(`⚠️ Duplicate invoice detected for ${file.name} with UUID: ${cfdiData.uuid}`);
      return { success: false, isDuplicate: true };
    }

    console.log(`📁 Generating file path for storage: ${file.name}`);
    const fileExt = file.name.split(".").pop();
    const filePath = `${crypto.randomUUID()}.${fileExt}`;
    console.log(`📁 Generated file path: ${filePath}`);

    // Upload file to storage
    console.log(`☁️ Uploading file to storage: ${file.name} -> ${filePath}`);
    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(filePath, file);

    if (uploadError) {
      console.error(`❌ Storage upload failed for ${file.name}:`, uploadError);
      return { success: false, isDuplicate: false, error: uploadError.message };
    }
    
    console.log(`✅ File uploaded successfully to storage: ${file.name}`);

    // First insert the invoice without the products
    console.log(`💾 Inserting invoice record for ${file.name}`);
    const invoiceData = {
      filename: file.name,
      file_path: filePath,
      content_type: file.type,
      size: file.size,
      xml_content: xmlContent,
      certificate_number: cfdiData.certificate_number,
      cfdi_stamp: cfdiData.cfdi_stamp,
      currency: cfdiData.currency,
      exchange_rate: cfdiData.exchange_rate,
      invoice_date: cfdiData.invoice_date,
      invoice_number: cfdiData.invoice_number,
      invoice_type: cfdiData.invoice_type,
      issuer_name: cfdiData.issuer_name,
      issuer_rfc: cfdiData.issuer_rfc,
      issuer_tax_regime: cfdiData.issuer_tax_regime,
      payment_form: cfdiData.payment_form,
      payment_method: cfdiData.payment_method,
      receiver_cfdi_use: cfdiData.receiver_cfdi_use,
      receiver_name: cfdiData.receiver_name,
      receiver_rfc: cfdiData.receiver_rfc,
      receiver_tax_regime: cfdiData.receiver_tax_regime,
      receiver_zip_code: cfdiData.receiver_zip_code,
      sat_certificate_number: cfdiData.sat_certificate_number,
      sat_stamp: cfdiData.sat_stamp,
      serie: cfdiData.serie,
      stamp_date: cfdiData.stamp_date,
      subtotal: cfdiData.subtotal,
      tax_amount: cfdiData.tax_amount,
      total_amount: cfdiData.total_amount,
      uuid: cfdiData.uuid,
      version: cfdiData.version,
      status: 'completed'
    };

    console.log(`💾 Invoice data to insert for ${file.name}:`, {
      filename: invoiceData.filename,
      uuid: invoiceData.uuid,
      invoice_number: invoiceData.invoice_number,
      total_amount: invoiceData.total_amount,
      issuer_rfc: invoiceData.issuer_rfc,
      productsCount: cfdiData.products?.length || 0
    });

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert(invoiceData)
      .select()
      .single();

    if (invoiceError) {
      console.error(`❌ Database insert failed for ${file.name}:`, invoiceError);
      
      // Clean up uploaded file on database error
      console.log(`🧹 Cleaning up uploaded file due to database error: ${filePath}`);
      await supabase.storage
        .from("invoices")
        .remove([filePath]);
        
      return { success: false, isDuplicate: false, error: invoiceError.message };
    }

    console.log(`✅ Invoice record created successfully for ${file.name} with ID: ${invoice?.id}`);

    // Then insert the products if any
    if (cfdiData.products && cfdiData.products.length > 0) {
      console.log(`📦 Inserting ${cfdiData.products.length} products for invoice ${invoice.id}`);
      
      const productsWithInvoiceId = cfdiData.products.map((product, index) => {
        console.log(`📦 Product ${index + 1}:`, {
          description: product.description,
          quantity: product.quantity,
          unitValue: product.unitValue,
          amount: product.amount
        });
        
        return {
          invoice_id: invoice.id,
          description: product.description,
          quantity: product.quantity,
          unit: product.unit,
          unit_value: product.unitValue,
          amount: product.amount,
          product_key: product.productKey,
          unit_key: product.unitKey
        };
      });

      const { error: productsError } = await supabase
        .from("invoice_products")
        .insert(productsWithInvoiceId);

      if (productsError) {
        console.error(`❌ Products insert failed for invoice ${invoice.id}:`, productsError);
        // We don't return false here since the invoice was already created
      } else {
        console.log(`✅ Successfully inserted ${productsWithInvoiceId.length} products for invoice ${invoice.id}`);
      }
    } else {
      console.log(`📦 No products found in the invoice XML for ${file.name}`);
    }

    console.log(`🎉 Invoice processing completed successfully for ${file.name}`);
    return { success: true, isDuplicate: false };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Critical error processing invoice ${file.name}:`, {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    return { success: false, isDuplicate: false, error: errorMessage };
  }
};
