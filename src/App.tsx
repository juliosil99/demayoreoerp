
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
import { useRouteAuth } from "./hooks/useRouteAuth";
import { AuthLoading } from "./components/auth/AuthLoading";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated, isLoading, canAccess } = useRouteAuth();

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <Layout>
            <Dashboard />
          </Layout>
        }
      />
      <Route
        path="/expenses"
        element={
          canAccess("can_view_expenses") ? (
            <Layout>
              <Expenses />
            </Layout>
          ) : (
            <Layout>
              <div className="container mx-auto p-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                  <p className="text-muted-foreground">
                    No tienes permisos para acceder a esta página.
                  </p>
                </div>
              </div>
            </Layout>
          )
        }
      />
      <Route
        path="/invoices"
        element={
          canAccess("can_view_invoices") ? (
            <Layout>
              <Invoices />
            </Layout>
          ) : (
            <Layout>
              <div className="container mx-auto p-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                  <p className="text-muted-foreground">
                    No tienes permisos para acceder a esta página.
                  </p>
                </div>
              </div>
            </Layout>
          )
        }
      />
      <Route
        path="/payables"
        element={
          canAccess("can_view_expenses") ? (
            <Layout>
              <Payables />
            </Layout>
          ) : (
            <Layout>
              <div className="container mx-auto p-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                  <p className="text-muted-foreground">
                    No tienes permisos para acceder a esta página.
                  </p>
                </div>
              </div>
            </Layout>
          )
        }
      />
      <Route
        path="/chart-of-accounts"
        element={
          canAccess("can_view_reports") ? (
            <Layout>
              <ChartOfAccounts />
            </Layout>
          ) : (
            <Layout>
              <div className="container mx-auto p-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                  <p className="text-muted-foreground">
                    No tienes permisos para acceder a esta página.
                  </p>
                </div>
              </div>
            </Layout>
          )
        }
      />
      <Route
        path="/reconciliation"
        element={
          canAccess("can_view_reconciliation") ? (
            <Layout>
              <Reconciliation />
            </Layout>
          ) : (
            <Layout>
              <div className="container mx-auto p-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                  <p className="text-muted-foreground">
                    No tienes permisos para acceder a esta página.
                  </p>
                </div>
              </div>
            </Layout>
          )
        }
      />
      <Route
        path="/reconciliation-batches"
        element={
          canAccess("can_view_reconciliation") ? (
            <Layout>
              <ReconciliationBatches />
            </Layout>
          ) : (
            <Layout>
              <div className="container mx-auto p-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                  <p className="text-muted-foreground">
                    No tienes permisos para acceder a esta página.
                  </p>
                </div>
              </div>
            </Layout>
          )
        }
      />
      <Route
        path="/reports"
        element={
          canAccess("can_view_reports") ? (
            <Layout>
              <Reports />
            </Layout>
          ) : (
            <Layout>
              <div className="container mx-auto p-6">
                <div className="text-center py-8">
                  <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
                  <p className="text-muted-foreground">
                    No tienes permisos para acceder a esta página.
                  </p>
                </div>
              </div>
            </Layout>
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
