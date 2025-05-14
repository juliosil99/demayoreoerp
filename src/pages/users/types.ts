export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  company?: {
    id: string;
    nombre: string;
  } | null;
}

export interface UserPermissions {
  userId: string;
  pages: { [path: string]: boolean };
  role: 'admin' | 'user';
}

export interface UserInvitation {
  id: string;
  email: string;
  status: string;
  created_at: string;
  company_id?: string;
  company_name?: string | null;
  role: 'admin' | 'user';
  invitation_token: string;
}

export const availablePages = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/sales', label: 'Ventas' },
  { path: '/expenses', label: 'Gastos' },
  { path: '/accounting', label: 'Contabilidad' },
  { path: '/contacts', label: 'Contactos' },
  { path: '/users', label: 'Usuarios' }
];
