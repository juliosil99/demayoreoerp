
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Users, FileText, TrendingUp, Shield, Zap } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: BarChart3,
      title: "Dashboard Inteligente",
      description: "Visualiza tus métricas de negocio en tiempo real"
    },
    {
      icon: FileText,
      title: "Facturación Digital",
      description: "Genera y gestiona facturas con cumplimiento fiscal"
    },
    {
      icon: Users,
      title: "Gestión de Contactos",
      description: "Centraliza clientes y proveedores en un solo lugar"
    },
    {
      icon: TrendingUp,
      title: "Reportes Avanzados",
      description: "Análisis profundo para decisiones inteligentes"
    },
    {
      icon: Shield,
      title: "Seguridad Total",
      description: "Tus datos protegidos con los más altos estándares"
    },
    {
      icon: Zap,
      title: "Automatización",
      description: "Simplifica procesos y ahorra tiempo valioso"
    }
  ];

  return (
    <div className="min-h-[calc(100vh-theme(spacing.16))] relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-primary/5" />
      
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 pt-20 pb-16">
        <div className="animate-fade-in max-w-4xl mx-auto">
          {/* Logo/Icon */}
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/20">
              <BarChart3 className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extralight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent leading-tight">
            Bienvenidos a
            <br />
            <span className="font-medium">Goco ERP</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl text-muted-foreground font-light mb-12 max-w-2xl mx-auto leading-relaxed">
            La plataforma de gestión empresarial que simplifica tus operaciones
            <br />
            <span className="text-primary">y potencia tu crecimiento</span>
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            className="px-8 py-6 text-lg font-medium rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
          >
            Comenzar Ahora
          </Button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="relative z-10 px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-light text-center mb-16 text-foreground/90">
            Todo lo que necesitas para gestionar tu empresa
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={feature.title}
                className="group border-0 bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-500 hover:scale-105 hover:shadow-xl animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-6 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300">
                    <feature.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground font-light leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="relative z-10 bg-gradient-to-r from-primary/5 to-primary/10 border-t border-border/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl font-light text-primary">2,000+</div>
              <div className="text-muted-foreground font-light">SKUs Gestionados</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-light text-primary">9</div>
              <div className="text-muted-foreground font-light">Canales de Venta</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-light text-primary">99.9%</div>
              <div className="text-muted-foreground font-light">Tiempo de Actividad</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
