
import React from 'react';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { SidebarHeader } from './SidebarHeader';
import { SidebarContent } from './SidebarContent';
import { SidebarLoading } from './SidebarLoading';

export const ProtectedSidebar: React.FC = () => {
  const { isLoading } = usePagePermissions();

  // Mostrar loading mientras cargamos permisos
  if (isLoading) {
    return <SidebarLoading />;
  }

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      <SidebarHeader />
      <SidebarContent />
    </div>
  );
};
