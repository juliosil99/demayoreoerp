
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
import { PathBasedProtectedRoute } from "./components/auth/PathBasedProtectedRoute";

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
                <PathBasedProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PathBasedProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/expenses"
              element={
                <PathBasedProtectedRoute>
                  <Layout>
                    <Expenses />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <PathBasedProtectedRoute>
                  <Layout>
                    <Invoices />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/payables"
              element={
                <PathBasedProtectedRoute>
                  <Layout>
                    <Payables />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/chart-of-accounts"
              element={
                <PathBasedProtectedRoute>
                  <Layout>
                    <ChartOfAccounts />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/reconciliation"
              element={
                <PathBasedProtectedRoute>
                  <Layout>
                    <Reconciliation />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/reconciliation-batches"
              element={
                <PathBasedProtectedRoute>
                  <Layout>
                    <ReconciliationBatches />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <PathBasedProtectedRoute>
                  <Layout>
                    <Reports />
                  </Layout>
                </PathBasedProtectedRoute>
              }
            />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
