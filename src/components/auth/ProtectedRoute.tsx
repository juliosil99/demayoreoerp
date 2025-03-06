
import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePagePermission } from "@/hooks/usePagePermission";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  pagePath: string;
}

export function ProtectedRoute({ children, pagePath }: ProtectedRouteProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasPermission, isLoading } = usePagePermission(pagePath);
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    if (!isLoading && hasPermission === false) {
      navigate("/dashboard");
    }
  }, [user, hasPermission, isLoading, navigate, pagePath]);
  
  if (!user) {
    return null;
  }
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }
  
  if (!hasPermission) {
    return null;
  }
  
  return <>{children}</>;
}
