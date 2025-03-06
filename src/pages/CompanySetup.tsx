
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
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function CompanySetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEditMode = window.location.search.includes('edit=true');
  const { companyData, isLoading, isEditing } = useCompanyData(user?.id, isEditMode);

  useEffect(() => {
    // Check if user was invited and redirect if necessary
    const checkInvitationStatus = async () => {
      if (!user?.email) {
        console.log("CompanySetup: No user email found, cannot check invitation status");
        return;
      }
      
      console.log("CompanySetup: Checking invitation status for email:", user.email);
      
      const { data: invitationData, error } = await supabase
        .from("user_invitations")
        .select("*")
        .eq("email", user.email)
        .eq("status", "completed")
        .maybeSingle();
      
      console.log("CompanySetup: Invitation check result:", invitationData);
      
      if (error) {
        console.error("CompanySetup: Error checking invitation status:", error);
      }
      
      if (invitationData) {
        console.log("CompanySetup: User was invited, redirecting to dashboard");
        // User was invited, redirect to dashboard
        navigate("/dashboard");
      } else {
        console.log("CompanySetup: User was not invited or invitation not completed");
      }
    };
    
    checkInvitationStatus();
  }, [user, navigate]);

  if (isLoading) {
    return <div>Cargando...</div>;
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
