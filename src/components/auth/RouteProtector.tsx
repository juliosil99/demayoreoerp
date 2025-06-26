
import React from 'react';
import { withProtection } from './withProtection';

interface RouteProtectorProps {
  children: React.ReactNode;
  requiresAdmin?: boolean;
  requiredPermission?: string;
}

const RouteProtectorBase: React.FC<RouteProtectorProps> = ({ children }) => {
  return <>{children}</>;
};

export const RouteProtector = withProtection(RouteProtectorBase);
