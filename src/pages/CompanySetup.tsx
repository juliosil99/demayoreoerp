
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
        
        if (companyError && companyError.code !== "PGRST116") {
          console.error("CompanySetup: Error checking user company:", companyError);
        }
        
        if (userCompany) {
          console.log("CompanySetup: User has their own company, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
        
        // Check for ANY invitation (either pending or completed)
        const { data: anyInvitation, error: invitationError } = await supabase
          .from("user_invitations")
          .select("*")
          .eq("email", user.email)
          .maybeSingle();
        
        console.log("CompanySetup: Any invitation check result:", anyInvitation);
        
        if (invitationError) {
          console.error("CompanySetup: Error checking invitations:", invitationError);
          toast.error("Error al verificar estado de invitación");
        }
        
        if (anyInvitation) {
          // If invitation is completed, user is part of a company
          if (anyInvitation.status === 'completed') {
            console.log("CompanySetup: User was invited and completed setup, redirecting to dashboard");
            navigate("/dashboard");
            return;
          } else {
            // If invitation is pending, they should finish registration
            console.log("CompanySetup: User was invited but registration not completed");
            navigate(`/register?token=${anyInvitation.invitation_token}`);
            return;
          }
        }
        
        // Check if there's any company in the system
        const { data: anyCompany } = await supabase
          .from("companies")
          .select("*")
          .limit(1);
            
        console.log("CompanySetup: Any company check result:", anyCompany);
          
        if (anyCompany && anyCompany.length > 0) {
          console.log("CompanySetup: Companies exist but none belongs to this user");
          // At this point companies exist but this user doesn't have one and wasn't invited
          toast.error("No tienes acceso a ninguna empresa. Contacta al administrador para obtener una invitación.");
          navigate("/login");
          return;
        }
        
        console.log("CompanySetup: No companies found, user can setup a new company");
        // No companies found - allow user to create the first company
      } catch (err) {
        console.error("CompanySetup: Unexpected error:", err);
        toast.error("Error verificando estado de usuario");
      } finally {
        setCheckingInvitation(false);
      }
    };
    
    checkInvitationStatus();
  }, [user, navigate]);

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
