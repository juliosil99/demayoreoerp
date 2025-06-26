
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from "@/components/ui/toaster";

export function Layout() {
  return (
    <div className="h-screen bg-background">
      <div className="flex h-full">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          
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
