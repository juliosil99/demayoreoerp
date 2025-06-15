
import { Outlet } from 'react-router-dom';
import { ProtectedSidebar } from './sidebar/ProtectedSidebar';
import { Header } from './Header';
import { Toaster } from "@/components/ui/toaster";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";

const MobileSidebarToggle = () => {
    const { toggleSidebar, isMobile } = useSidebar();

    if (!isMobile) {
        return null;
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
        >
            <Menu className="h-5 w-5" />
        </Button>
    );
};

function AppLayout() {
  return (
    <div className="h-screen bg-background">
      <div className="flex h-full">
        <ProtectedSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header>
            <MobileSidebarToggle />
          </Header>
          
          <main className="flex-1 min-h-0 overflow-y-auto">
            <div className="p-2 md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export function Layout() {
  return (
    <SidebarProvider>
      <AppLayout />
    </SidebarProvider>
  );
}
