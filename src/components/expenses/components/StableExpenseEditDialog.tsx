
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { dialogLogger } from "@/utils/dialogLogger";
import { X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
  expense_invoice_relations?: {
    invoice: {
      uuid: string;
      invoice_number: string;
      file_path: string;
      filename: string;
      content_type?: string;
    }
  }[];
};

interface StableExpenseEditDialogProps {
  isOpen: boolean;
  expense: Expense;
  onClose: () => void;
  onSuccess: () => void;
}

export function StableExpenseEditDialog({ 
  isOpen, 
  expense, 
  onClose,
  onSuccess 
}: StableExpenseEditDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>('exited');

  // Handle mounting/unmounting
  useEffect(() => {
    if (isOpen && !mounted) {
      setMounted(true);
      // Start enter animation on the next frame
      requestAnimationFrame(() => {
        setAnimationState('entering');
        setTimeout(() => {
          setAnimationState('entered');
        }, 300);
      });
    } else if (!isOpen && mounted) {
      // Start exit animation
      setAnimationState('exiting');
      const timer = setTimeout(() => {
        setAnimationState('exited');
        setMounted(false);
      }, 300); // Match dialog animation duration
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);
  
  // Log dialog events
  useEffect(() => {
    if (isOpen) {
      dialogLogger.logOpen("StableExpenseEditDialog", { expenseId: expense.id });
    }
  }, [isOpen, expense.id]);

  // Handle close request
  const handleClose = () => {
    dialogLogger.logClose("StableExpenseEditDialog", { expenseId: expense.id, status: "cancelled" });
    onClose();
  };
  
  // Handle form success
  const handleFormSuccess = () => {
    dialogLogger.logClose("StableExpenseEditDialog", { expenseId: expense.id, status: "success" });
    onSuccess();
  };

  // Don't render anything if not mounted
  if (!mounted) return null;

  // Create portal for the dialog
  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${
        animationState === 'entering' || animationState === 'entered' ? 'opacity-100' : 'opacity-0'
      } transition-opacity duration-300`}
    >
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80"
        onClick={handleClose}
      />
      
      {/* Dialog content */}
      <div 
        className={`fixed z-50 grid w-full max-w-2xl translate-y-0 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg ${
          animationState === 'entering' || animationState === 'entered' 
            ? 'translate-y-0 scale-100' 
            : 'translate-y-4 scale-95'
        } transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Editar Gasto</h2>
          <p className="text-sm text-muted-foreground">
            Modifique los detalles del gasto y guarde los cambios
          </p>
        </div>
        
        {/* Form */}
        <ExpenseForm
          initialData={expense}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>,
    document.body
  );
}
