
import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface SidebarGroupProps {
  title: string;
  children: React.ReactNode;
  isOpen?: boolean;
}

export const SidebarGroup: React.FC<SidebarGroupProps> = ({ title, children, isOpen = false }) => {
  const [open, setOpen] = useState(isOpen);
  
  // Si no hay children visibles, no mostrar el grupo
  if (!children || (Array.isArray(children) && children.length === 0)) {
    return null;
  }

  return (
    <div className="mb-2">
      <button
        className="flex items-center justify-between w-full px-3 py-2 text-gray-200 hover:text-white"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium">{title}</span>
        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </button>
      {open && <div className="pl-3 space-y-1">{children}</div>}
    </div>
  );
};
