
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { ProtectedSidebar } from './sidebar/ProtectedSidebar';
import { Header } from './Header';
import { Toaster } from "@/components/ui/toaster";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

export function Layout() {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Close sidebar by default on mobile devices
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1 relative">
        {/* Mobile sidebar toggle button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 left-2 z-30" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-20" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div 
          className={`${
            isMobile 
              ? `fixed left-0 top-16 bottom-0 z-25 w-64 transition-transform duration-200 ease-in-out ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
              : `relative w-64 transition-all duration-200 ease-in-out ${
                  sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`
          }`}
        >
          <div className="h-full overflow-y-auto">
            <ProtectedSidebar />
          </div>
        </div>
        
        {/* Main content */}
        <main className="flex-1 min-h-0">
          <div className="p-2 md:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  );
}
