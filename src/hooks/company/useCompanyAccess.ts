
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useCompanyAccess(isEditMode: boolean) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user?.id || !user.email) {
        setCheckingAccess(false);
        return;
      }

      try {
        const { data: userCompanyMembership } = await supabase
          .from("company_users")
          .select("company_id")
          .eq("user_id", user.id)
          .maybeSingle();

        const { data: userOwnedCompany } = await supabase
          .from("companies")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if ((userCompanyMembership || userOwnedCompany) && !isEditMode) {
          navigate("/dashboard");
          return;
        }

        if (isEditMode) {
          if (userOwnedCompany) {
            setHasAccess(true);
          } else {
            toast.error("No tienes permiso para editar esta empresa.");
            navigate("/dashboard");
          }
          setCheckingAccess(false);
          return;
        }

        if (!userCompanyMembership && !userOwnedCompany) {
          const { count } = await supabase
            .from("companies")
            .select('*', { count: 'exact', head: true });

          if (count === 0) {
            setHasAccess(true);
            setCheckingAccess(false);
            return;
          }

          const { data: invitations } = await supabase
            .from("user_invitations")
            .select("invitation_token")
            .eq("email", user.email)
            .eq("status", "pending")
            .limit(1);

          if (invitations && invitations.length > 0) {
            navigate(`/register?token=${invitations[0].invitation_token}`);
            return;
          }

          toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
          setHasAccess(false);
        } else {
           setHasAccess(false);
        }
        
      } catch (error) {
        toast.error("Error al verificar tus permisos de acceso.");
        setHasAccess(false);
      } finally {
        setCheckingAccess(false);
      }
    };

    if (user?.id) {
        checkAccess();
    } else {
        setCheckingAccess(false);
    }
  }, [user, isEditMode, navigate]);

  return { checkingAccess, hasAccess };
}
