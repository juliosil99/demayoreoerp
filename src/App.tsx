import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { PathBasedProtectedRoute } from "@/components/auth/PathBasedProtectedRoute";
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
const Monitoring = lazy(() => import("./pages/Monitoring"));

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

                {/* Home page - shows the welcome page directly */}
                <Route path="/" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Index />
                  </Suspense>
                } />

                {/* Smart redirect route - for users who want to go to their main page */}
                <Route path="/home" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <SmartRedirect />
                    </Layout>
                  </PathBasedProtectedRoute>
                } />
                
                <Route path="/dashboard" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Dashboard />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/crm" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CrmDashboard />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/companies" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Companies />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/companies/:id" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CompanyDetail />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/contacts" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Contacts />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/sales" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Sales />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/sales/payments" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Payments />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/sales/invoices" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Invoices />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/expenses" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Expenses />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/expenses/reconciliation" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Reconciliation />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/expenses/receivables" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Receivables />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/expenses/payables" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Payables />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/accounting/banking" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Banking />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/accounting/banking/:accountId" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <BankAccountMovements />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/accounting/transfers" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <AccountTransfers />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/accounting/chart-of-accounts" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <ChartOfAccounts />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/accounting/reports" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Reports />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/accounting/cash-flow-forecast" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CashFlowForecast />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/product-search" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <ProductSearch />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/pdf-templates" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PdfTemplates />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/users" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <UserManagement />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/company-setup" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CompanySetup />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/sales-channels" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <SalesChannels />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/accounting/banking/:accountId/payment-schedule" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <CreditPaymentSchedule />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/profile" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Profile />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
                } />

                <Route path="/monitoring" element={
                  <PathBasedProtectedRoute>
                    <Layout>
                      <Suspense fallback={<div>Loading...</div>}>
                        <Monitoring />
                      </Suspense>
                    </Layout>
                  </PathBasedProtectedRoute>
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
