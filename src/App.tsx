import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { PathBasedProtectedRoute } from '@/components/auth/PathBasedProtectedRoute';

// Import all pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Analytics from '@/pages/Analytics';
import Sales from '@/pages/Sales';
import Expenses from '@/pages/Expenses';
import Reconciliation from '@/pages/Reconciliation';
import Banking from '@/pages/Banking';
import BankAccountMovements from '@/pages/BankAccountMovements';
import AccountTransfers from '@/pages/AccountTransfers';
import CreditPaymentSchedule from '@/pages/CreditPaymentSchedule';
import Invoices from '@/pages/Invoices';
import ProductSearch from '@/pages/ProductSearch';
import Reports from '@/pages/Reports';
import Contacts from '@/pages/Contacts';
import UserManagement from '@/pages/UserManagement';
import Companies from '@/pages/Companies';
import CompanyDetail from '@/pages/CompanyDetail';
import CompanySetup from '@/pages/CompanySetup';
import SalesChannels from '@/pages/SalesChannels';
import Monitoring from '@/pages/Monitoring';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Accounting from '@/pages/Accounting';
import ChartOfAccounts from '@/pages/ChartOfAccounts';
import CashFlowForecast from '@/pages/CashFlowForecast';
import Payables from '@/pages/Payables';
import Receivables from '@/pages/Receivables';
import CrmDashboard from '@/pages/CrmDashboard';
import CrmChat from '@/pages/CrmChat';
import Payments from '@/pages/sales/Payments';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                
                <Route 
                  path="/dashboard" 
                  element={
                    <PathBasedProtectedRoute>
                      <Dashboard />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/analytics" 
                  element={
                    <PathBasedProtectedRoute>
                      <Analytics />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/sales" 
                  element={
                    <PathBasedProtectedRoute>
                      <Sales />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/sales/payments" 
                  element={
                    <PathBasedProtectedRoute>
                      <Payments />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/sales/invoices" 
                  element={
                    <PathBasedProtectedRoute>
                      <Invoices />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/expenses" 
                  element={
                    <PathBasedProtectedRoute>
                      <Expenses />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/expenses/reconciliation" 
                  element={
                    <PathBasedProtectedRoute>
                      <Reconciliation />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/expenses/payables" 
                  element={
                    <PathBasedProtectedRoute>
                      <Payables />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/expenses/receivables" 
                  element={
                    <PathBasedProtectedRoute>
                      <Receivables />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/accounting/banking" 
                  element={
                    <PathBasedProtectedRoute>
                      <Banking />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/accounting/banking/account/:accountId" 
                  element={
                    <PathBasedProtectedRoute>
                      <BankAccountMovements />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/accounting/transfers" 
                  element={
                    <PathBasedProtectedRoute>
                      <AccountTransfers />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/accounting/credit-schedule/:accountId" 
                  element={
                    <PathBasedProtectedRoute>
                      <CreditPaymentSchedule />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/accounting/chart-of-accounts" 
                  element={
                    <PathBasedProtectedRoute>
                      <ChartOfAccounts />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/accounting/reports" 
                  element={
                    <PathBasedProtectedRoute>
                      <Reports />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/accounting/cash-flow-forecast" 
                  element={
                    <PathBasedProtectedRoute>
                      <CashFlowForecast />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/product-search" 
                  element={
                    <PathBasedProtectedRoute>
                      <ProductSearch />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/contacts" 
                  element={
                    <PathBasedProtectedRoute>
                      <Contacts />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/users" 
                  element={
                    <PathBasedProtectedRoute>
                      <UserManagement />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/companies" 
                  element={
                    <PathBasedProtectedRoute>
                      <Companies />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/companies/:id" 
                  element={
                    <PathBasedProtectedRoute>
                      <CompanyDetail />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/company-setup" 
                  element={
                    <PathBasedProtectedRoute>
                      <CompanySetup />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/sales-channels" 
                  element={
                    <PathBasedProtectedRoute>
                      <SalesChannels />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/monitoring" 
                  element={
                    <PathBasedProtectedRoute>
                      <Monitoring />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/crm" 
                  element={
                    <PathBasedProtectedRoute>
                      <CrmDashboard />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/crm/chat" 
                  element={
                    <PathBasedProtectedRoute>
                      <CrmChat />
                    </PathBasedProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />
              </Route>
            </Routes>
            
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
