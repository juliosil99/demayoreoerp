export const parseXMLContent = (xmlContent: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  
  const comprobante = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
  const emisor = xmlDoc.getElementsByTagName("cfdi:Emisor")[0];
  const receptor = xmlDoc.getElementsByTagName("cfdi:Receptor")[0];
  const timbreFiscal = xmlDoc.getElementsByTagName("tfd:TimbreFiscalDigital")[0];

  return {
    uuid: timbreFiscal?.getAttribute("UUID") || null,
    serie: comprobante?.getAttribute("Serie") || null,
    invoice_number: comprobante?.getAttribute("Folio") || null,
    invoice_date: comprobante?.getAttribute("Fecha") || null,
    total_amount: parseFloat(comprobante?.getAttribute("Total") || "0"),
    currency: comprobante?.getAttribute("Moneda") || null,
    payment_method: comprobante?.getAttribute("MetodoPago") || null,
    payment_form: comprobante?.getAttribute("FormaPago") || null,
    subtotal: parseFloat(comprobante?.getAttribute("SubTotal") || "0"),
    exchange_rate: parseFloat(comprobante?.getAttribute("TipoCambio") || "1"),
    issuer_rfc: emisor?.getAttribute("Rfc") || null,
    issuer_name: emisor?.getAttribute("Nombre") || null,
    issuer_tax_regime: emisor?.getAttribute("RegimenFiscal") || null,
    receiver_rfc: receptor?.getAttribute("Rfc") || null,
    receiver_name: receptor?.getAttribute("Nombre") || null,
    receiver_tax_regime: receptor?.getAttribute("RegimenFiscalReceptor") || null,
    receiver_cfdi_use: receptor?.getAttribute("UsoCFDI") || null,
    receiver_zip_code: receptor?.getAttribute("DomicilioFiscalReceptor") || null,
    certificate_number: comprobante?.getAttribute("NoCertificado") || null,
    stamp_date: timbreFiscal?.getAttribute("FechaTimbrado") || null,
    sat_certificate_number: timbreFiscal?.getAttribute("NoCertificadoSAT") || null,
    cfdi_stamp: timbreFiscal?.getAttribute("SelloCFD") || null,
    sat_stamp: timbreFiscal?.getAttribute("SelloSAT") || null,
  };
};