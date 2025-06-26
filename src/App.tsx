
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Invoices from "./pages/Invoices";
import Payables from "./pages/Payables";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import Reconciliation from "./pages/Reconciliation";
import Reports from "./pages/Reports";
import { Layout } from "./components/layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReconciliationBatches from "./pages/ReconciliationBatches";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route path="expenses" element={
                <ProtectedRoute requiredPermission="can_view_expenses">
                  <Expenses />
                </ProtectedRoute>
              } />
              
              <Route path="invoices" element={
                <ProtectedRoute requiredPermission="can_view_invoices">
                  <Invoices />
                </ProtectedRoute>
              } />
              
              <Route path="payables" element={
                <ProtectedRoute requiredPermission="can_view_expenses">
                  <Payables />
                </ProtectedRoute>
              } />
              
              <Route path="chart-of-accounts" element={
                <ProtectedRoute requiredPermission="can_view_reports">
                  <ChartOfAccounts />
                </ProtectedRoute>
              } />
              
              <Route path="reconciliation" element={
                <ProtectedRoute requiredPermission="can_view_reconciliation">
                  <Reconciliation />
                </ProtectedRoute>
              } />
              
              <Route path="reconciliation-batches" element={
                <ProtectedRoute requiredPermission="can_view_reconciliation">
                  <ReconciliationBatches />
                </ProtectedRoute>
              } />
              
              <Route path="reports" element={
                <ProtectedRoute requiredPermission="can_view_reports">
                  <Reports />
                </ProtectedRoute>
              } />
            </Route>
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
