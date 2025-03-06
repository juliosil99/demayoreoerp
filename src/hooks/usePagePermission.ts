
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function usePagePermission(pagePath: string) {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (!user) {
        setHasPermission(false);
        setIsLoading(false);
        return;
      }
      
      try {
        if (isAdmin) {
          setHasPermission(true);
          setIsLoading(false);
          return;
        }
        
        // Check page permission
        const { data: permission, error } = await supabase
          .from("page_permissions")
          .select("can_access")
          .eq("user_id", user.id)
          .eq("page_path", pagePath)
          .maybeSingle();
        
        if (error) {
          console.error("Error checking page permission:", error);
          setHasPermission(false);
        } else {
          setHasPermission(permission?.can_access || false);
        }
      } catch (error) {
        console.error("Error in permission check:", error);
        setHasPermission(false);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkPermission();
  }, [user, pagePath, isAdmin]);

  // This function enforces the permission check and redirects if needed
  const enforcePermission = () => {
    if (!isLoading && !hasPermission) {
      toast.error("No tienes acceso a esta página");
      navigate("/dashboard");
      return false;
    }
    return true;
  };

  return { hasPermission, isLoading, enforcePermission };
}
