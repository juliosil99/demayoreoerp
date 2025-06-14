import React from 'react';
import { Home, Users, Building2, Settings, HelpCircle, Plus, ListChecks, BarChartBig, KanbanSquare, FileText, UserPlus, CheckCheck, LucideIcon } from 'lucide-react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permissions: string[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Panel', icon: Home, permissions: ['dashboard.view'] },
  { href: '/crm/companies', label: 'Empresas', icon: Building2, permissions: ['companies.view'] },
  { href: '/crm/contacts', label: 'Contactos', icon: Users, permissions: ['contacts.view'] },
  { href: '/tasks', label: 'Tareas', icon: ListChecks, permissions: ['tasks.view'] },
  { href: '/sales', label: 'Ventas', icon: BarChartBig, permissions: ['sales.view'] },
  { href: '/projects', label: 'Proyectos', icon: KanbanSquare, permissions: ['projects.view'] },
  { href: '/documents', label: 'Documentos', icon: FileText, permissions: ['documents.view'] },
  { href: '/reconciliation', label: 'Conciliación', icon: CheckCheck, permissions: ['reconciliation.view'] },
];

export const SidebarContent: React.FC = () => {
  const { pathname } = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const createCompanyMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('companies')
        .insert({
          name: 'Nueva Empresa',
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating company:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Empresa creada',
        description: 'Redirigiendo a la nueva empresa...',
      });
      queryClient.invalidateQueries({ queryKey: ['crm-companies'] });
      window.location.href = `/crm/companies/${data.id}`;
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al crear la empresa.',
        variant: 'destructive',
      });
    },
  });

  const createContactMutation = useMutation({
    mutationFn: async () => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('contacts')
        .insert({
          name: 'Nuevo Contacto',
          user_id: user.id,
          rfc: 'XAXX010101000',
          type: 'client',
          postal_code: '00000',
          tax_regime: '601',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Contacto creado',
        description: 'Redirigiendo al nuevo contacto...',
      });
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      window.location.href = `/crm/contacts/${data.id}`;
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Error al crear el contacto.',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="flex flex-col flex-1 p-2">
      <nav className="flex flex-col space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-800 ${
                isActive
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-400 hover:text-gray-100'
              }`
            }
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Accordion type="single" collapsible className="w-full mt-4">
        <AccordionItem value="crm">
          <AccordionTrigger className="hover:no-underline text-sm text-gray-400 hover:text-gray-100">
            CRM <Plus className="w-4 h-4 ml-auto" />
          </AccordionTrigger>
          <AccordionContent>
            <div className="flex flex-col space-y-1 mt-2">
              <Button
                variant="ghost"
                className="justify-start text-sm text-gray-400 hover:text-gray-100"
                onClick={() => createCompanyMutation.mutate()}
                disabled={createCompanyMutation.isLoading}
              >
                <Building2 className="w-4 h-4 mr-2" />
                Nueva Empresa
              </Button>
              <Button
                variant="ghost"
                className="justify-start text-sm text-gray-400 hover:text-gray-100"
                onClick={() => createContactMutation.mutate()}
                disabled={createContactMutation.isLoading}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Nuevo Contacto
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <nav className="mt-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="admin">
            <AccordionTrigger className="hover:no-underline text-sm text-gray-400 hover:text-gray-100">
              Admin <Settings className="w-4 h-4 ml-auto" />
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-1 mt-2">
                <NavLink
                  to="/admin/users"
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-800 ${
                      isActive
                        ? 'bg-gray-700 text-white'
                        : 'text-gray-400 hover:text-gray-100'
                    }`
                  }
                >
                  <Users className="w-4 h-4 mr-2" />
                  Usuarios
                </NavLink>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </nav>
      
      <Link
        to="/crm/chat"
        className="block px-4 py-2 text-left hover:bg-blue-50 rounded transition font-medium"
      >
        💬 Chat de Clientes
      </Link>

      <div className="mt-auto">
        <NavLink
          to="/help"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-gray-800 ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-100'
            }`
          }
        >
          <HelpCircle className="w-4 h-4 mr-2" />
          Ayuda
        </NavLink>
      </div>
    </div>
  );
};
