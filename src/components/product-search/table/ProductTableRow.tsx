
import React, { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { ProductSearchResult } from "@/types/product-search";
import { formatCurrency } from "@/utils/formatters";
import { ActionButtons } from "../actions/ActionButtons";

interface ProductTableRowProps {
  product: ProductSearchResult;
  downloadXml: (invoiceId: number) => Promise<void>;
  generatePdf: (invoiceId: number, issuerRfc: string) => Promise<void>;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
  product,
  downloadXml,
  generatePdf,
}) => {
  return (
    <TableRow key={product.id}>
      <TableCell className="font-medium">{product.description}</TableCell>
      <TableCell>{product.quantity}</TableCell>
      <TableCell>{formatCurrency(product.unit_value || 0)}</TableCell>
      <TableCell>{formatCurrency(product.amount || 0)}</TableCell>
      <TableCell>
        {product.invoice?.invoice_number || 'N/A'}
        {product.invoice?.serie && ` - ${product.invoice.serie}`}
      </TableCell>
      <TableCell>
        {product.invoice?.invoice_date ? 
          new Date(product.invoice.invoice_date).toLocaleDateString() : 
          product.invoice?.stamp_date ?
          new Date(product.invoice.stamp_date).toLocaleDateString() + " (timbrado)" :
          'N/A'}
      </TableCell>
      <TableCell>{product.invoice?.issuer_name || 'N/A'}</TableCell>
      <TableCell className="text-right">
        <ActionButtons 
          product={product} 
          downloadXml={downloadXml}
          generatePdf={generatePdf}
        />
      </TableCell>
    </TableRow>
  );
};
