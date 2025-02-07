
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/components/layout/Layout";
import Login from "@/pages/Login";
import CompanySetup from "@/pages/CompanySetup";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Invoices from "@/pages/Invoices";
import Banking from "@/pages/Banking";
import Contacts from "@/pages/Contacts";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import Expenses from "@/pages/Expenses";
import Reconciliation from "@/pages/Reconciliation";
import "./App.css";

const queryClient = new QueryClient();

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/company-setup"
              element={
                <PrivateRoute>
                  <CompanySetup />
                </PrivateRoute>
              }
            />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="sales" element={<Sales />} />
              <Route path="sales/payments" element={<Sales />} />
              <Route path="sales/invoices" element={<Invoices />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="banking" element={<Banking />} />
              <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />
              <Route path="reconciliation" element={<Reconciliation />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
