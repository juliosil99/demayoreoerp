
export interface Profile {
  id: string;
  email: string;
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
  company_id?: string;
  company_name?: string;
  invited_by: string;
  invitation_token?: string;
}

export interface CompanyUser {
  id: string;
  user_id: string;
  company_id: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface UserPermissions {
  userId: string;
  role: 'admin' | 'user';
  canManageUsers: boolean;
  canViewExpenses: boolean;
  canViewSales: boolean;
  canViewDashboard: boolean;
}

// Simplified role-based permissions
export const rolePermissions = {
  admin: {
    canManageUsers: true,
    canViewExpenses: true,
    canViewSales: true,
    canViewDashboard: true,
  },
  user: {
    canManageUsers: false,
    canViewExpenses: true,
    canViewSales: true,
    canViewDashboard: true,
  },
} as const;
