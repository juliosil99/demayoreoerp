
import React from 'react';
import { usePagePermissions } from '@/hooks/usePagePermissions';
import { SidebarHeader as AppSidebarHeader } from './SidebarHeader';
import { SidebarContent as AppSidebarContent } from './SidebarContent';
import { SidebarLoading } from './SidebarLoading';
import { Sidebar } from '@/components/ui/sidebar';

export const ProtectedSidebar: React.FC = () => {
  const { isLoading } = usePagePermissions();

  return (
    <Sidebar>
      <div className="bg-gray-900 text-white h-full flex flex-col">
        {isLoading ? (
          <SidebarLoading />
        ) : (
          <>
            <AppSidebarHeader />
            <div className="flex-1 overflow-auto p-4 space-y-2">
              <AppSidebarContent />
            </div>
          </>
        )}
      </div>
    </Sidebar>
  );
};
