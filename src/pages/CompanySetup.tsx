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
        console.log("CompanySetup: No user found");
        setCheckingAccess(false);
        return;
      }
      
      try {
        console.log("CompanySetup: Checking access for user:", user.id);
        console.log("CompanySetup: isEditMode:", isEditMode);
        
        // Check if user has their own company
        const { data: userCompany, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        if (companyError) {
          console.error("CompanySetup: Error checking company:", companyError);
          throw companyError;
        }
        
        console.log("CompanySetup: User company check result:", userCompany);
        
        // If in edit mode and user has a company, they can access
        if (isEditMode && userCompany) {
          console.log("CompanySetup: User can edit their company");
          setHasAccess(true);
          setCheckingAccess(false);
          return;
        }
        
        // If not in edit mode and user doesn't have a company, check if they can create one
        if (!isEditMode && !userCompany) {
          // Check if any company exists
          const { data: anyCompany, error: anyCompanyError } = await supabase
            .from("companies")
            .select("count")
            .limit(1);
            
          if (anyCompanyError) {
            console.error("CompanySetup: Error checking for any company:", anyCompanyError);
            throw anyCompanyError;
          }
          
          console.log("CompanySetup: Any company check result:", anyCompany);
          
          // If no companies exist, user can create one
          if (!anyCompany || anyCompany.length === 0 || anyCompany[0].count === 0) {
            console.log("CompanySetup: No companies exist, user can create one");
            setHasAccess(true);
            setCheckingAccess(false);
            return;
          }
          
          // Otherwise, check for invitations
          const { data: invitations, error: invitationError } = await supabase
            .from("user_invitations")
            .select("*")
            .eq("email", user.email || '')
            .in("status", ["pending", "completed"]);
            
          if (invitationError) {
            console.error("CompanySetup: Error checking invitations:", invitationError);
            throw invitationError;
          }
          
          console.log("CompanySetup: Invitations check result:", invitations);
          
          // If user has an invitation, they might be able to access depending on status
          if (invitations && invitations.length > 0) {
            const pendingInvitation = invitations.find(inv => inv.status === 'pending');
            if (pendingInvitation) {
              console.log("CompanySetup: User has pending invitation, redirecting to register");
              navigate(`/register?token=${pendingInvitation.invitation_token}`);
              return;
            }
            
            const completedInvitation = invitations.find(inv => inv.status === 'completed');
            if (completedInvitation) {
              console.log("CompanySetup: User has completed invitation, redirecting to dashboard");
              navigate("/dashboard");
              return;
            }
          }
          
          // If companies exist but user doesn't have one and wasn't invited
          console.log("CompanySetup: User has no access to any company");
          toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
          setHasAccess(false);
          setCheckingAccess(false);
          return;
        }
        
        // Default case: if we get here, the user doesn't have access
        console.log("CompanySetup: User has no access to edit/create company");
        setHasAccess(false);
        setCheckingAccess(false);
        
      } catch (error) {
        console.error("CompanySetup: Unexpected error:", error);
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
