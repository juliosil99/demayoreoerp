
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Toaster } from "@/components/ui/toaster";
import { DialogEventLogger } from '@/components/debug/DialogEventLogger';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-grow">
        <Sidebar />
        <main className="flex-grow overflow-auto">{children}</main>
      </div>
      <Toaster />
      <DialogEventLogger />
    </div>
  );
}
