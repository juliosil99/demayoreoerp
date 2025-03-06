
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

export default function CompanySetup() {
  const { user, userCompanies, currentCompany } = useAuth();
  const navigate = useNavigate();
  const isEditMode = window.location.search.includes('edit=true');
  const { companyData, isLoading, isEditing } = useCompanyData(user?.id, isEditMode);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    // Check if user has permission to access this page
    const checkAccess = async () => {
      if (!user) {
        console.log("CompanySetup: No user found, redirecting to login");
        navigate("/login");
        return;
      }
      
      // In edit mode, we need to check if there's a company to edit
      if (isEditMode) {
        if (!currentCompany) {
          if (userCompanies && userCompanies.length > 0) {
            // If user has companies but none is selected, redirect to profile to select one
            console.log("CompanySetup: No company selected, redirecting to profile");
            toast.info("Por favor selecciona una empresa para editar");
            navigate("/profile");
            return;
          } else {
            console.log("CompanySetup: No companies found for editing");
            toast.error("No tienes empresas para editar");
            navigate("/dashboard");
            return;
          }
        }
      } else {
        // Not in edit mode - check if user should be here
        if (userCompanies && userCompanies.length > 0) {
          console.log("CompanySetup: User already has companies, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
      }
      
      setCheckingAccess(false);
    };
    
    checkAccess();
  }, [user, navigate, isEditMode, currentCompany, userCompanies]);

  if (isLoading || checkingAccess) {
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
            defaultValues={currentCompany || companyData || undefined}
            isEditing={isEditing}
            userId={user?.id || ''}
          />
        </CardContent>
      </Card>
    </div>
  );
}
