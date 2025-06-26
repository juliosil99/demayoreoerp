import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Expenses from "./pages/Expenses";
import Invoices from "./pages/Invoices";
import Payables from "./pages/Payables";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import Reconciliation from "./pages/Reconciliation";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Layout from "./components/layout/Layout";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient } from "@tanstack/react-query";
import ReconciliationBatches from "./pages/ReconciliationBatches";

function PathBasedProtectedRoute({
  children,
  requiredPermission,
}: {
  children: React.ReactNode;
  requiredPermission: string;
}) {
  const { user, hasPermission, isAdmin } = useAuth();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" />;
  }

  if (!isAdmin() && !hasPermission(requiredPermission)) {
    // Redirect to dashboard or show an unauthorized page if no permission
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster />
        <QueryClient>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_dashboard">
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_dashboard">
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_expenses">
                  <Layout>
                    <Expenses />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_invoices">
                  <Layout>
                    <Invoices />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/payables"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_expenses">
                  <Layout>
                    <Payables />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/chart-of-accounts"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_reports">
                  <Layout>
                    <ChartOfAccounts />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/reconciliation"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_reconciliation">
                  <Layout>
                    <Reconciliation />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/reconciliation-batches"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_reconciliation">
                  <Layout>
                    <ReconciliationBatches />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PathBasedProtectedRoute requiredPermission="can_view_reports">
                  <Layout>
                    <Reports />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <PathBasedProtectedRoute requiredPermission="can_edit_settings">
                  <Layout>
                    <Settings />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
          </Routes>
        </QueryClient>
      </AuthProvider>
    </Router>
  );
}

export default App;
