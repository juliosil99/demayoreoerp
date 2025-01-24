export const parseXMLContent = (xmlContent: string) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlContent, "text/xml");
  
  const comprobante = xmlDoc.getElementsByTagName("cfdi:Comprobante")[0];
  const emisor = xmlDoc.getElementsByTagName("cfdi:Emisor")[0];
  const receptor = xmlDoc.getElementsByTagName("cfdi:Receptor")[0];
  const timbreFiscal = xmlDoc.getElementsByTagName("tfd:TimbreFiscalDigital")[0];
  const conceptos = xmlDoc.getElementsByTagName("cfdi:Conceptos")[0];
  
  // Parse product details
  const products = Array.from(conceptos?.getElementsByTagName("cfdi:Concepto") || []).map(concepto => ({
    description: concepto.getAttribute("Descripcion"),
    quantity: parseFloat(concepto.getAttribute("Cantidad") || "0"),
    unit: concepto.getAttribute("Unidad"),
    unitValue: parseFloat(concepto.getAttribute("ValorUnitario") || "0"),
    amount: parseFloat(concepto.getAttribute("Importe") || "0"),
    productKey: concepto.getAttribute("ClaveProdServ"),
    unitKey: concepto.getAttribute("ClaveUnidad"),
  }));

  // Calculate total tax amount from Traslados
  let totalTaxAmount = 0;
  const impuestos = xmlDoc.getElementsByTagName("cfdi:Impuestos")[0];
  const traslados = impuestos?.getElementsByTagName("cfdi:Traslado") || [];
  Array.from(traslados).forEach(traslado => {
    totalTaxAmount += parseFloat(traslado.getAttribute("Importe") || "0");
  });

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
    invoice_type: comprobante?.getAttribute("TipoDeComprobante") || null,
    version: comprobante?.getAttribute("Version") || null,
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
    tax_amount: totalTaxAmount,
    products: products,
  };
};