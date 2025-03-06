
export interface UserPermissions {
  userId: string;
  pages: { [key: string]: boolean };
  role: 'admin' | 'user';
}

export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
}

export interface UserInvitation {
  id: string;
  email: string;
  status: string;
  role: 'admin' | 'user';
  created_at: string;
  invitation_token?: string;
  invited_by?: string;
}

export interface InvitationLog {
  id: string;
  invitation_id: string;
  status: string;
  error_message: string | null;
  attempted_by: string;
  created_at: string;
}

export const availablePages = [
  { path: "/dashboard", label: "Panel de Control" },
  { path: "/sales", label: "Ventas" },
  { path: "/expenses", label: "Gastos" },
  { path: "/contacts", label: "Contactos" },
  { path: "/banking", label: "Bancos" },
  { path: "/accounting/chart-of-accounts", label: "Catálogo de Cuentas" },
  { path: "/reconciliation", label: "Conciliación" },
] as const;
