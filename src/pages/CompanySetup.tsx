import { Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompanyForm } from "@/components/company/CompanyForm";
import { useCompanyData } from "@/hooks/company/useCompanyData";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export default function CompanySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = window.location.search.includes('edit=true');
  const { companyData, isLoading, isEditing } = useCompanyData(user?.id, isEditMode);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    // Check if user can access this page
    const checkAccess = async () => {
      if (!user?.id) {
        setCheckingAccess(false);
        return;
      }
      
      try {
        // First check if user is already a member of any company
        const { data: userCompanyMembership, error: membershipError } = await supabase
          .from("company_users")
          .select("*, companies(id, nombre)")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (membershipError) {
          throw membershipError;
        }
        
        // If user is already a member of a company and not in edit mode, redirect to dashboard
        if (userCompanyMembership && !isEditMode) {
          navigate("/dashboard");
          return;
        }
        
        // Check if user owns a company (for edit mode)
        const { data: userOwnedCompany, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (companyError) {
          throw companyError;
        }
        
        // If in edit mode, user must own a company
        if (isEditMode) {
          if (userOwnedCompany) {
            setHasAccess(true);
            setCheckingAccess(false);
            return;
          } else {
            toast.error("No tienes permiso para editar esta empresa");
            navigate("/dashboard");
            return;
          }
        }
        
        // If not in edit mode and user doesn't belong to any company
        if (!userCompanyMembership && !userOwnedCompany) {
          // Check if any company exists in the system
          const { data: anyCompany, error: anyCompanyError } = await supabase
            .from("companies")
            .select("count")
            .limit(1);
            
          if (anyCompanyError) {
            throw anyCompanyError;
          }
          
          // If no companies exist, user can create the first one
          if (!anyCompany || anyCompany.length === 0 || anyCompany[0].count === 0) {
            setHasAccess(true);
            setCheckingAccess(false);
            return;
          }
          
          // Otherwise, check for invitations
          const { data: invitations, error: invitationError } = await supabase
            .from("user_invitations")
            .select("*")
            .eq("email", user.email || '')
            .eq("status", "pending");
            
          if (invitationError) {
            throw invitationError;
          }
          
          // If user has a pending invitation, redirect to register with token
          if (invitations && invitations.length > 0) {
            const pendingInvitation = invitations[0];
            navigate(`/register?token=${pendingInvitation.invitation_token}`);
            return;
          }
          
          // If companies exist but user doesn't have one and wasn't invited
          toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
          setHasAccess(false);
          setCheckingAccess(false);
          return;
        }
        
        // Default case: if we get here, the user doesn't have access
        setHasAccess(false);
        setCheckingAccess(false);
        
      } catch (error) {
        toast.error("Error al verificar permisos");
        setHasAccess(false);
        setCheckingAccess(false);
      }
    };
    
    checkAccess();
  }, [user, isEditMode, navigate]);
  
  if (isLoading || checkingAccess) {
    return <div className="container flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  // If user doesn't have access and not in edit mode, show message but don't redirect
  if (!hasAccess && !isEditing) {
    return (
      <div className="container flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Building className="h-6 w-6" />
              <CardTitle className="text-2xl">Acceso Denegado</CardTitle>
            </div>
            <CardDescription>
              No tienes permiso para configurar o editar una empresa. Contacta al administrador para obtener una invitación.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            <CardTitle className="text-2xl">
              {isEditing ? "Editar Información de Empresa" : "Configuración de Empresa"}
            </CardTitle>
          </div>
          <CardDescription>
            {isEditing 
              ? "Actualiza la información de tu empresa"
              : "Ingresa la información de tu empresa para comenzar"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm 
            defaultValues={companyData || undefined}
            isEditing={isEditing}
            userId={user?.id || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}
