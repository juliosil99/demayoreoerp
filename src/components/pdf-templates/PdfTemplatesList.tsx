
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { IssuerPdfConfig } from "@/types/pdf-templates";

interface PdfTemplatesListProps {
  templates: IssuerPdfConfig[];
  isLoading: boolean;
  onEdit: (template: IssuerPdfConfig) => void;
  onDelete: (id: string) => Promise<void>;
}

export const PdfTemplatesList = ({
  templates,
  isLoading,
  onEdit,
  onDelete,
}: PdfTemplatesListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No hay plantillas configuradas. Crea una nueva plantilla para personalizar los PDFs generados.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>RFC Emisor</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Dirección</TableHead>
            <TableHead>Contacto</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates.map((template) => (
            <TableRow key={template.id}>
              <TableCell className="font-medium">{template.issuer_rfc}</TableCell>
              <TableCell>{template.issuer_name || 'N/A'}</TableCell>
              <TableCell>{template.address || 'N/A'}</TableCell>
              <TableCell>
                {template.phone && <div>{template.phone}</div>}
                {template.email && <div className="text-xs">{template.email}</div>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onEdit(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="text-red-500 hover:text-red-700"
                    onClick={() => onDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
