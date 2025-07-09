import { Settings, LogOut, User, Building2, Palette, Sun, Moon, Laptop, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent, DropdownMenuRadioGroup, DropdownMenuRadioItem } from "@/components/ui/dropdown-menu";
import React, { useState } from "react";
import { NotificationCenter } from "@/components/crm/notifications";
import { CompanySelector } from "./CompanySelector";

interface HeaderProps {
  children?: React.ReactNode;
}

type Theme = "light" | "dark" | "blue";

export function Header({
  children
}: HeaderProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") as Theme || "light";
    }
    return "light";
  });

  React.useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again."
      });
    }
  };

  return <header className="bg-background border-b border-border px-4 py-3 md:px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {children}
          <CompanySelector />
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <NotificationCenter />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:inline-flex">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                <User className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/company-setup?edit=true")}>
                <Building2 className="mr-2 h-4 w-4" />
                Empresa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/sales-channels")}>
                <Settings2 className="mr-2 h-4 w-4" />
                Canales de Venta
              </DropdownMenuItem>
              
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette className="mr-2 h-4 w-4" />
                  Tema
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup value={theme} onValueChange={value => setTheme(value as Theme)}>
                    <DropdownMenuRadioItem value="light">
                      <Sun className="mr-2 h-4 w-4" />
                      Claro
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon className="mr-2 h-4 w-4" />
                      Oscuro
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="blue">
                      <Laptop className="mr-2 h-4 w-4" />
                      Azul
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>;
}
