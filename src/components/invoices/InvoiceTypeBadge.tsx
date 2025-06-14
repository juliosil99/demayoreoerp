
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { getInvoiceTypeInfo } from '@/utils/invoiceTypeUtils';

interface InvoiceTypeBadgeProps {
  invoiceType: string | null;
  showTooltip?: boolean;
  size?: 'sm' | 'default';
}

export const InvoiceTypeBadge: React.FC<InvoiceTypeBadgeProps> = ({ 
  invoiceType, 
  showTooltip = true,
  size = 'sm'
}) => {
  const typeInfo = getInvoiceTypeInfo(invoiceType);
  
  return (
    <Badge 
      variant="outline" 
      className={`${typeInfo.color} ${size === 'sm' ? 'text-xs px-2 py-0.5' : ''}`}
      title={showTooltip ? typeInfo.description : undefined}
    >
      {typeInfo.label}
    </Badge>
  );
};
