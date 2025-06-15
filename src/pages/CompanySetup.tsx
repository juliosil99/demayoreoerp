
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CompanyForm } from "@/components/company/CompanyForm";
import { useCompanyData } from "@/hooks/company/useCompanyData";
import { useCompanyAccess } from "@/hooks/company/useCompanyAccess";
import { AccessDeniedCard } from "@/components/company/AccessDeniedCard";
import { CompanySetupHeader } from "@/components/company/CompanySetupHeader";

export default function CompanySetup() {
  const { user } = useAuth();
  const isEditMode = window.location.search.includes('edit=true');
  
  const { checkingAccess, hasAccess } = useCompanyAccess(isEditMode);
  const { companyData, isLoading: isCompanyDataLoading, isEditing } = useCompanyData(user?.id, isEditMode);

  if (isCompanyDataLoading || checkingAccess) {
    return <div className="container flex items-center justify-center min-h-screen">Cargando...</div>;
  }
  
  if (!hasAccess) {
    return (
      <div className="container flex items-center justify-center min-h-screen p-4">
        <AccessDeniedCard />
      </div>
    );
  }

  return (
    <div className="container flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg">
        <CompanySetupHeader isEditing={isEditing} />
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
