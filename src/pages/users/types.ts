
export interface Profile {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  created_at?: string;
  company?: {
    id: string;
    nombre: string;
  };
}

export interface UserInvitation {
  id: string;
  email: string;
  role: 'admin' | 'user';
  status: 'pending' | 'accepted' | 'expired';
  created_at: string;
  expires_at: string;
  invitation_token?: string;
  company_id?: string;
  company_name?: string;
  invited_by: string;
}

export interface UserPermissions {
  userId: string;
  role: 'admin' | 'user';
  can_view_dashboard: boolean;
  can_view_sales: boolean;
  can_manage_sales: boolean;
  can_view_expenses: boolean;
  can_manage_expenses: boolean;
  can_view_reports: boolean;
  can_manage_users: boolean;
  can_manage_contacts: boolean;
  can_view_banking: boolean;
  can_manage_banking: boolean;
  can_view_invoices: boolean;
  can_manage_invoices: boolean;
  can_view_reconciliation: boolean;
  can_manage_reconciliation: boolean;
}

export const rolePermissions: Record<'admin' | 'user', Omit<UserPermissions, 'userId' | 'role'>> = {
  admin: {
    can_view_dashboard: true,
    can_view_sales: true,
    can_manage_sales: true,
    can_view_expenses: true,
    can_manage_expenses: true,
    can_view_reports: true,
    can_manage_users: true,
    can_manage_contacts: true,
    can_view_banking: true,
    can_manage_banking: true,
    can_view_invoices: true,
    can_manage_invoices: true,
    can_view_reconciliation: true,
    can_manage_reconciliation: true,
  },
  user: {
    can_view_dashboard: true,
    can_view_sales: true,
    can_manage_sales: false,
    can_view_expenses: true,
    can_manage_expenses: false,
    can_view_reports: false,
    can_manage_users: false,
    can_manage_contacts: false,
    can_view_banking: false,
    can_manage_banking: false,
    can_view_invoices: true,
    can_manage_invoices: false,
    can_view_reconciliation: false,
    can_manage_reconciliation: false,
  },
};
