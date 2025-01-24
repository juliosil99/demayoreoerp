import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/accounting" element={<div>Contabilidad (En desarrollo)</div>} />
            <Route path="/receivables" element={<div>Cuentas por Cobrar (En desarrollo)</div>} />
            <Route path="/payables" element={<div>Cuentas por Pagar (En desarrollo)</div>} />
            <Route path="/banking" element={<div>Bancos (En desarrollo)</div>} />
            <Route path="/reconciliation" element={<div>Conciliación (En desarrollo)</div>} />
            <Route path="/reports" element={<div>Reportes (En desarrollo)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;