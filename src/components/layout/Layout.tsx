
import { useState, useEffect } from 'react';
import { ProtectedSidebar } from './ProtectedSidebar';
import { Header } from './Header';
import { Toaster } from "@/components/ui/toaster";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
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
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow relative overflow-hidden">
        {/* Mobile sidebar toggle button */}
        {isMobile && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-2 left-2 z-20" 
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Responsive sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-200 ease-in-out w-64 md:translate-x-0 fixed md:static h-[calc(100vh-64px)] z-10 overflow-y-auto`}
        >
          <ProtectedSidebar />
        </div>
        
        {/* Main content */}
        <main 
          className={`flex-grow overflow-auto p-2 md:p-6 transition-all duration-200 ease-in-out ${
            isMobile ? 'w-full' : (sidebarOpen ? 'md:ml-0' : 'md:ml-0')
          }`}
        >
          {/* Overlay for mobile when sidebar is open */}
          {isMobile && sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-0" 
              onClick={() => setSidebarOpen(false)}
            />
          )}
          {children}
        </main>
      </div>
      <Toaster />
    </div>
  );
}
