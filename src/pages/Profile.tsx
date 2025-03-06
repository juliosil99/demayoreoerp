
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { CompanyUsersManagement } from "@/components/company/CompanyUsersManagement";

export default function Profile() {
  const { user, userCompanies, currentCompany, setCurrentCompany } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'profile' | 'company'>('profile');

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Perfil</h1>
        <div className="flex space-x-2">
          <Button 
            variant={activeTab === 'profile' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('profile')}
          >
            Perfil
          </Button>
          <Button 
            variant={activeTab === 'company' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('company')}
          >
            Empresa
          </Button>
        </div>
      </div>

      {activeTab === 'profile' && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Usuario</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                <p className="text-base">{user.email}</p>
              </div>
              <div className="pt-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/company-setup?edit=true")}
                >
                  Editar Información de Empresa
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'company' && (
        <div className="space-y-6">
          {userCompanies && userCompanies.length > 0 ? (
            <>
              {userCompanies.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Seleccionar Empresa</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userCompanies.map((company) => (
                        <Card 
                          key={company.id} 
                          className={`cursor-pointer ${currentCompany?.id === company.id ? 'border-primary' : ''}`}
                          onClick={() => setCurrentCompany(company)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-medium">{company.nombre}</h3>
                            <p className="text-sm text-muted-foreground">RFC: {company.rfc}</p>
                            <div className="mt-2">
                              <span className="text-xs bg-secondary text-secondary-foreground rounded-full px-2 py-1">
                                {company.userRole === 'admin' ? 'Administrador' : 'Usuario'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentCompany && (
                <CompanyUsersManagement companyId={currentCompany.id} />
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 flex flex-col items-center justify-center">
                <p className="mb-4">No tienes empresas registradas</p>
                <Button onClick={() => navigate("/company-setup")}>
                  Registrar Empresa
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
