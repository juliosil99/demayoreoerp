
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  to: string;
  onClick?: () => void;
  isActive: boolean;
}

export const SidebarItem = React.memo<SidebarItemProps>(({ icon: Icon, label, to, onClick, isActive }) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      'flex items-center px-3 py-2 rounded-md text-sm transition-colors hover:bg-gray-800 group',
      isActive ? 'bg-gray-800 text-white' : 'text-gray-400'
    )}
  >
    <Icon className="h-5 w-5 mr-3" />
    <span>{label}</span>
  </Link>
));

SidebarItem.displayName = 'SidebarItem';
