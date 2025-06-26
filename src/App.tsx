
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
import { RouteProtector } from "./components/auth/RouteProtector";

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
            <Route
              path="/"
              element={
                <RouteProtector>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RouteProtector>
              }
            />
            <Route
              path="/dashboard"
              element={
                <RouteProtector>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </RouteProtector>
              }
            />
            <Route
              path="/expenses"
              element={
                <RouteProtector requiredPermission="can_view_expenses">
                  <Layout>
                    <Expenses />
                  </Layout>
                </RouteProtector>
              }
            />
            <Route
              path="/invoices"
              element={
                <RouteProtector requiredPermission="can_view_invoices">
                  <Layout>
                    <Invoices />
                  </Layout>
                </RouteProtector>
              }
            />
            <Route
              path="/payables"
              element={
                <RouteProtector requiredPermission="can_view_expenses">
                  <Layout>
                    <Payables />
                  </Layout>
                </RouteProtector>
              }
            />
            <Route
              path="/chart-of-accounts"
              element={
                <RouteProtector requiredPermission="can_view_reports">
                  <Layout>
                    <ChartOfAccounts />
                  </Layout>
                </RouteProtector>
              }
            />
            <Route
              path="/reconciliation"
              element={
                <RouteProtector requiredPermission="can_view_reconciliation">
                  <Layout>
                    <Reconciliation />
                  </Layout>
                </RouteProtector>
              }
            />
            <Route
              path="/reconciliation-batches"
              element={
                <RouteProtector requiredPermission="can_view_reconciliation">
                  <Layout>
                    <ReconciliationBatches />
                  </Layout>
                </RouteProtector>
              }
            />
            <Route
              path="/reports"
              element={
                <RouteProtector requiredPermission="can_view_reports">
                  <Layout>
                    <Reports />
                  </Layout>
                </RouteProtector>
              }
            />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
