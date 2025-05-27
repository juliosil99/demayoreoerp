
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface InvitationStatusBadgeProps {
  status: 'pending' | 'accepted' | 'expired';
  expiresAt?: string;
}

export function InvitationStatusBadge({ status, expiresAt }: InvitationStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pending':
        // Check if it's close to expiring (less than 24 hours)
        if (expiresAt) {
          const now = new Date();
          const expiration = new Date(expiresAt);
          const hoursUntilExpiration = (expiration.getTime() - now.getTime()) / (1000 * 60 * 60);
          
          if (hoursUntilExpiration < 24) {
            return {
              variant: "destructive" as const,
              icon: AlertCircle,
              text: "Expira pronto",
              className: "bg-orange-100 text-orange-800 border-orange-300"
            };
          }
        }
        return {
          variant: "secondary" as const,
          icon: Clock,
          text: "Pendiente",
          className: "bg-yellow-100 text-yellow-800 border-yellow-300"
        };
      case 'accepted':
        return {
          variant: "default" as const,
          icon: CheckCircle,
          text: "Aceptada",
          className: "bg-green-100 text-green-800 border-green-300"
        };
      case 'expired':
        return {
          variant: "destructive" as const,
          icon: XCircle,
          text: "Expirada",
          className: "bg-red-100 text-red-800 border-red-300"
        };
      default:
        return {
          variant: "secondary" as const,
          icon: Clock,
          text: "Desconocido",
          className: ""
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={`inline-flex items-center gap-1 ${config.className}`}>
      <Icon className="h-3 w-3" />
      {config.text}
    </Badge>
  );
}
