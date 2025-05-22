
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { PaymentTable } from "./PaymentTable";
import { PaymentFilters } from "./PaymentFilters";
import { PaymentPagination } from "./PaymentPagination";

interface PaymentsContentProps {
  payments: any[];
  isLoading: boolean;
  pagination: any;
  filters: any;
  onUpdateFilters: (filters: any) => void;
  setPagination: (pagination: any) => void;
  onOpenAddPayment: () => void;
  onEdit: (payment: any) => void;
  onDelete: (id: string) => void;
  onStatusUpdate: (id: string, status: 'confirmed' | 'pending') => void;
  onViewReconciled: (id: string) => void;
}

export function PaymentsContent({
  payments,
  isLoading,
  pagination,
  filters,
  onUpdateFilters,
  setPagination,
  onOpenAddPayment,
  onEdit,
  onDelete,
  onStatusUpdate,
  onViewReconciled
}: PaymentsContentProps) {
  const showReconciledFilter = (value: boolean | 'all') => {
    onUpdateFilters({
      ...filters,
      isReconciled: value
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between mb-6">
          <PaymentFilters 
            filters={filters} 
            onChangeFilters={onUpdateFilters} 
            onToggleReconciled={showReconciledFilter}
          />
          <Button onClick={onOpenAddPayment}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Pago
          </Button>
        </div>

        <PaymentTable 
          payments={payments} 
          isLoading={isLoading} 
          onEdit={onEdit} 
          onDelete={onDelete} 
          onStatusUpdate={onStatusUpdate}
          onViewReconciled={onViewReconciled}
        />

        <PaymentPagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      </CardContent>
    </Card>
  );
}
