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
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function CompanySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = window.location.search.includes('edit=true');
  const { companyData, isLoading, isEditing } = useCompanyData(user?.id, isEditMode);
  const [checkingInvitation, setCheckingInvitation] = useState(true);

  useEffect(() => {
    // Check if user was invited and redirect if necessary
    const checkInvitationStatus = async () => {
      if (!user?.email) {
        console.log("CompanySetup: No user email found, cannot check invitation status");
        setCheckingInvitation(false);
        return;
      }
      
      console.log("CompanySetup: Checking invitation status for email:", user.email);
      
      try {
        // First check if user has a company
        const { data: userCompany, error: companyError } = await supabase
          .from("companies")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();
          
        console.log("CompanySetup: User company check result:", userCompany);
        
        if (companyError) {
          console.error("CompanySetup: Error checking user company:", companyError);
          throw companyError;
        }
        
        if (userCompany) {
          // If in edit mode and user has their own company, this is valid, so just let the component render
          if (isEditMode) {
            console.log("CompanySetup: User has their own company and is in edit mode, allowing edit");
            setCheckingInvitation(false);
            return;
          }
          
          // If not in edit mode, redirect to dashboard since they already have a company
          console.log("CompanySetup: User has their own company, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Check for ALL invitations related to this email
        const { data: invitations, error: invitationError } = await supabase
          .from("user_invitations")
          .select("*")
          .eq("email", user.email);
        
        console.log("CompanySetup: All invitations for this user:", invitations);
        
        if (invitationError) {
          console.error("CompanySetup: Error checking invitations:", invitationError);
          throw invitationError;
        }
        
        // Check for completed invitations
        const completedInvitation = invitations?.find(inv => inv.status === 'completed');
        
        if (completedInvitation) {
          console.log("CompanySetup: User has a completed invitation, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Check for pending invitations
        const pendingInvitation = invitations?.find(inv => inv.status === 'pending');
        
        if (pendingInvitation) {
          console.log("CompanySetup: User has a pending invitation, redirecting to registration");
          navigate(`/register?token=${pendingInvitation.invitation_token}`);
          return;
        }
        
        // Check for expired invitations
        const expiredInvitation = invitations?.find(inv => inv.status === 'expired');
        
        if (expiredInvitation) {
          console.log("CompanySetup: User has an expired invitation");
          toast.error("Tu invitación ha expirado. Contacta al administrador para que la reactive.");
        }
        
        // Check if there's any company in the system
        const { data: anyCompany, error: anyCompanyError } = await supabase
          .from("companies")
          .select("*")
          .limit(1);
            
        console.log("CompanySetup: Any company check result:", anyCompany);
        
        if (anyCompanyError) {
          console.error("CompanySetup: Error checking for any company:", anyCompanyError);
          throw anyCompanyError;
        }
          
        if (anyCompany && anyCompany.length > 0) {
          console.log("CompanySetup: Companies exist but none belongs to this user");
          // At this point companies exist but this user doesn't have one and wasn't invited
          // IMPORTANT: Don't redirect to login here, just show a message and keep user on the page
          toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
          setCheckingInvitation(false);
          return;
        }
        
        console.log("CompanySetup: No companies found, user can setup a new company");
        // No companies found - allow user to create the first company
        setCheckingInvitation(false);
      } catch (err) {
        console.error("CompanySetup: Unexpected error:", err);
        toast.error("Error verificando estado de usuario");
        setCheckingInvitation(false);
      }
    };
    
    checkInvitationStatus();
  }, [user, navigate, isEditMode]);

  if (isLoading || checkingInvitation) {
    return <div className="container flex items-center justify-center min-h-screen">Cargando...</div>;
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
