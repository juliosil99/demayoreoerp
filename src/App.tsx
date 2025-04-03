
import * as React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
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

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
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
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/payments" element={<Payments />} />
            <Route path="sales/invoices" element={<Invoices />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="expenses/reconciliation" element={<Reconciliation />} />
            <Route path="expenses/receivables" element={<Receivables />} />
            <Route path="expenses/payables" element={<Payables />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="accounting" element={<Accounting />} />
            <Route path="accounting/chart-of-accounts" element={<ChartOfAccounts />} />
            <Route path="accounting/banking" element={<Banking />} />
            <Route path="accounting/banking/account/:accountId" element={<BankAccountMovements />} />
            <Route path="accounting/reports" element={<Reports />} />
            <Route path="accounting/transfers" element={<AccountTransfers />} />
            <Route path="accounting/cash-flow-forecast" element={<CashFlowForecast />} />
            <Route path="sales-channels" element={<SalesChannels />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Routes>
      </Router>
      <Toaster />
    </>
  );
}

export default App;
