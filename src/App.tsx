
import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import CompanySetup from "@/pages/CompanySetup";
import Dashboard from "@/pages/Dashboard";
import Sales from "@/pages/Sales";
import Payments from "@/pages/sales/Payments";
import Invoices from "@/pages/Invoices";
import Banking from "@/pages/Banking";
import BankAccountMovements from "@/pages/BankAccountMovements";
import Contacts from "@/pages/Contacts";
import ChartOfAccounts from "@/pages/ChartOfAccounts";
import Expenses from "@/pages/Expenses";
import Reconciliation from "@/pages/Reconciliation";
import Reports from "@/pages/Reports";
import Accounting from "@/pages/Accounting";
import AccountTransfers from "@/pages/AccountTransfers";
import Receivables from "@/pages/Receivables";
import Payables from "@/pages/Payables";
import Profile from "@/pages/Profile";
import SalesChannels from "@/pages/SalesChannels";
import UserManagement from "@/pages/UserManagement";
import CashFlowForecast from "@/pages/CashFlowForecast";
import CreditPaymentSchedule from "./pages/CreditPaymentSchedule";
import { CaptchaResolver } from "./components/invoices/sat-automation/CaptchaResolver";
import ProductSearch from "./pages/ProductSearch";
import PdfTemplates from "./pages/PdfTemplates";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function LayoutWrapper() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
                <LayoutWrapper />
              </PrivateRoute>
            }
          >
            <Route index element={
              <ProtectedRoute permission="can_view_dashboard">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="dashboard" element={
              <ProtectedRoute permission="can_view_dashboard">
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="profile" element={<Profile />} />
            <Route path="sales" element={
              <ProtectedRoute permission="can_view_sales">
                <Sales />
              </ProtectedRoute>
            } />
            <Route path="sales/payments" element={
              <ProtectedRoute permission="can_view_sales">
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="sales/invoices" element={
              <ProtectedRoute permission="can_view_invoices">
                <Invoices />
              </ProtectedRoute>
            } />
            <Route path="sales/invoices/captcha/:sessionId" element={<CaptchaResolver />} />
            <Route path="product-search" element={
              <ProtectedRoute permission="can_view_invoices">
                <ProductSearch />
              </ProtectedRoute>
            } />
            <Route path="pdf-templates" element={
              <ProtectedRoute permission="can_manage_invoices">
                <PdfTemplates />
              </ProtectedRoute>
            } />
            <Route path="expenses" element={
              <ProtectedRoute permission="can_view_expenses">
                <Expenses />
              </ProtectedRoute>
            } />
            <Route path="expenses/reconciliation" element={
              <ProtectedRoute permission="can_view_reconciliation">
                <Reconciliation />
              </ProtectedRoute>
            } />
            <Route path="expenses/receivables" element={
              <ProtectedRoute permission="can_view_expenses">
                <Receivables />
              </ProtectedRoute>
            } />
            <Route path="expenses/payables" element={
              <ProtectedRoute permission="can_view_expenses">
                <Payables />
              </ProtectedRoute>
            } />
            <Route path="contacts" element={
              <ProtectedRoute permission="can_manage_contacts">
                <Contacts />
              </ProtectedRoute>
            } />
            <Route path="accounting" element={
              <ProtectedRoute permission="can_view_reports">
                <Accounting />
              </ProtectedRoute>
            } />
            <Route path="accounting/chart-of-accounts" element={
              <ProtectedRoute permission="can_view_reports">
                <ChartOfAccounts />
              </ProtectedRoute>
            } />
            <Route path="accounting/banking" element={
              <ProtectedRoute permission="can_view_banking">
                <Banking />
              </ProtectedRoute>
            } />
            <Route path="/accounting/banking/account/:accountId" element={
              <ProtectedRoute permission="can_view_banking">
                <BankAccountMovements />
              </ProtectedRoute>
            } />
            <Route path="/accounting/banking/payment-schedule/:accountId" element={
              <ProtectedRoute permission="can_view_banking">
                <CreditPaymentSchedule />
              </ProtectedRoute>
            } />
            <Route path="accounting/reports" element={
              <ProtectedRoute permission="can_view_reports">
                <Reports />
              </ProtectedRoute>
            } />
            <Route path="accounting/transfers" element={
              <ProtectedRoute permission="can_manage_banking">
                <AccountTransfers />
              </ProtectedRoute>
            } />
            <Route path="accounting/cash-flow-forecast" element={
              <ProtectedRoute permission="can_view_reports">
                <CashFlowForecast />
              </ProtectedRoute>
            } />
            <Route path="sales-channels" element={<SalesChannels />} />
            <Route path="users" element={
              <ProtectedRoute permission="can_manage_users">
                <UserManagement />
              </ProtectedRoute>
            } />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
