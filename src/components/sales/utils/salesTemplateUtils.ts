
import { utils, writeFile } from "xlsx";
import { toast } from "@/components/ui/use-toast";

/**
 * Descarga un template de Excel para importación de ventas
 */
export const downloadSalesExcelTemplate = () => {
  const headers = [
    "Fecha",
    "No. Orden", 
    "Producto", 
    "SKU", 
    "Cantidad", 
    "Monto", 
    "Categoria", 
    "Nombre Proveedor", 
    "Costo", 
    "Canal", 
    "Comisión", 
    "Envío", 
    "Retención", 
    "Ganancia", 
    "Margen", 
    "Ciudad", 
    "Estado", 
    "Código Postal", 
    "Factura", 
    "Fecha Factura", 
    "Fecha de Pago", 
    "ID Cliente", 
    "Hora", 
    "Estado/Provincia"
  ];

  const exampleData = [
    {
      "Fecha": "2024-04-22",
      "No. Orden": "ORD-001",
      "Producto": "Ejemplo Producto",
      "SKU": "SKU12345",
      "Cantidad": 2,
      "Monto": 1500.00,
      "Categoria": "Electrónica",
      "Nombre Proveedor": "Proveedor S.A.",
      "Costo": 1200.00,
      "Canal": "Amazon",
      "Comisión": 50.00,
      "Envío": 30.00,
      "Retención": 0.00,
      "Ganancia": 300.00,
      "Margen": 20,
      "Ciudad": "Ciudad de México",
      "Estado": "Ciudad de México",
      "Código Postal": "01000",
      "Factura": "F-789",
      "Fecha Factura": "2024-04-20",
      "Fecha de Pago": "2024-04-22",
      "ID Cliente": 101,
      "Hora": "13:45",
      "Estado/Provincia": "CDMX"
    }
  ];

  const ws = utils.json_to_sheet(exampleData, { header: headers });
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, "Ventas");

  try {
    writeFile(wb, "plantilla_ventas.xlsx");
    toast({
      title: "Plantilla descargada",
      description: "La plantilla de ventas se descargó exitosamente.",
    });
  } catch (error) {
    console.error("Error generando plantilla ventas:", error);
    toast({
      title: "Error",
      description: "No se pudo generar la plantilla.",
      variant: "destructive",
    });
  }
};

