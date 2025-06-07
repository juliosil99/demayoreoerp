import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SmartRedirect } from "@/components/navigation/SmartRedirect";
import { Layout } from "@/components/layout/Layout";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CrmDashboard = lazy(() => import("./pages/CrmDashboard"));
const Companies = lazy(() => import("./pages/Companies"));
const CompanyDetail = lazy(() => import("./pages/CompanyDetail"));
const Contacts = lazy(() => import("./pages/Contacts"));
const Sales = lazy(() => import("./pages/Sales"));
const Payments = lazy(() => import("./pages/sales/Payments"));
const Invoices = lazy(() => import("./pages/Invoices"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Reconciliation = lazy(() => import("./pages/Reconciliation"));
const Receivables = lazy(() => import("./pages/Receivables"));
const Payables = lazy(() => import("./pages/Payables"));
const Banking = lazy(() => import("./pages/Banking"));
const BankAccountMovements = lazy(() => import("./pages/BankAccountMovements"));
const AccountTransfers = lazy(() => import("./pages/AccountTransfers"));
const ChartOfAccounts = lazy(() => import("./pages/ChartOfAccounts"));
const Reports = lazy(() => import("./pages/Reports"));
const CashFlowForecast = lazy(() => import("./pages/CashFlowForecast"));
const ProductSearch = lazy(() => import("./pages/ProductSearch"));
const PdfTemplates = lazy(() => import("./pages/PdfTemplates"));
const UserManagement = lazy(() => import("./pages/UserManagement"));
const CompanySetup = lazy(() => import("./pages/CompanySetup"));
const SalesChannels = lazy(() => import("./pages/SalesChannels"));
const CreditPaymentSchedule = lazy(() => import("./pages/CreditPaymentSchedule"));
const Register = lazy(() => import("./pages/Register/Register"));
const Profile = lazy(() => import("./pages/Profile"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Login />
                  </Suspense>
                } />
                <Route path="/register" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Register />
                  </Suspense>
                } />

                {/* Protected routes with layout */}
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout>
                      <SmartRedirect />
                    </Layout>
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Dashboard />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/crm" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CrmDashboard />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/companies" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Companies />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/companies/:id" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CompanyDetail />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                
                
                <Route path="/contacts" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Contacts />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/sales" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Sales />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/sales/payments" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Payments />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/sales/invoices" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Invoices />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/expenses" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Expenses />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/expenses/reconciliation" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Reconciliation />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/expenses/receivables" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Receivables />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/expenses/payables" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Payables />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/accounting/banking" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Banking />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/accounting/banking/:accountId" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <BankAccountMovements />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/accounting/transfers" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <AccountTransfers />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/accounting/chart-of-accounts" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <ChartOfAccounts />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/accounting/reports" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Reports />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/accounting/cash-flow-forecast" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CashFlowForecast />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/product-search" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <ProductSearch />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/pdf-templates" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PdfTemplates />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/users" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <UserManagement />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/company-setup" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CompanySetup />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/sales-channels" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <SalesChannels />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/accounting/banking/:accountId/payment-schedule" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CreditPaymentSchedule />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />

                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Profile />
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                } />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
