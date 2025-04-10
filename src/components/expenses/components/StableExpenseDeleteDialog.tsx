
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Database } from "@/integrations/supabase/types/base";

type Expense = Database['public']['Tables']['expenses']['Row'] & {
  bank_accounts: { name: string };
  chart_of_accounts: { name: string; code: string };
  contacts: { name: string } | null;
};

interface StableExpenseDeleteDialogProps {
  isOpen: boolean;
  expense: Expense;
  onClose: () => void;
  onDelete: () => Promise<void | { success: boolean; log: string[] }>;
}

export function StableExpenseDeleteDialog({ 
  isOpen, 
  expense, 
  onClose,
  onDelete
}: StableExpenseDeleteDialogProps) {
  const [mounted, setMounted] = useState(false);
  const [animationState, setAnimationState] = useState<'entering' | 'entered' | 'exiting' | 'exited'>('exited');
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Handle delete with loading state
  const handleDeleteClick = async () => {
    setIsDeleting(true);
    try {
      await onDelete();
    } finally {
      setIsDeleting(false);
      onClose();
    }
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
        onClick={onClose}
      />
      
      {/* Dialog content */}
      <div 
        className={`fixed z-50 grid w-full max-w-lg translate-y-0 gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg ${
          animationState === 'entering' || animationState === 'entered' 
            ? 'translate-y-0 scale-100' 
            : 'translate-y-4 scale-95'
        } transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        {/* Header */}
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">Confirmar Eliminación</h2>
          <p className="text-sm text-muted-foreground">
            Esta acción no se puede deshacer. Se eliminará permanentemente este gasto.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="mt-2 sm:mt-0 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            disabled={isDeleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2"
            disabled={isDeleting}
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
