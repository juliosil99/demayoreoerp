
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, FileText, Calculator, ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Accounting() {
  const navigate = useNavigate();

  const accountingModules = [
    {
      title: "Catálogo de Cuentas",
      description: "Gestiona tu plan de cuentas contable",
      icon: BookOpen,
      route: "/accounting/chart-of-accounts",
    },
    {
      title: "Reportes Financieros",
      description: "Accede a reportes contables y financieros",
      icon: FileText,
      route: "/reports",
    },
    {
      title: "Conciliación",
      description: "Concilia tus cuentas y movimientos",
      icon: Calculator,
      route: "/reconciliation",
    },
    {
      title: "Transferencias entre Cuentas",
      description: "Gestiona movimientos entre tus cuentas",
      icon: ArrowLeftRight,
      route: "/accounting/transfers",
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Contabilidad</h1>
        <p className="text-muted-foreground">
          Gestiona tus actividades contables y financieras
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {accountingModules.map((module) => (
          <Card key={module.route} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-2">
                <module.icon className="h-5 w-5" />
                <CardTitle>{module.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{module.description}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => navigate(module.route)}
              >
                Acceder
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
