
import React from "react";
import { Badge } from "@/components/ui/badge";

interface InvitationStatusBadgeProps {
  status: string;
}

export function InvitationStatusBadge({ status }: InvitationStatusBadgeProps) {
  switch(status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
    case 'completed':
      return <Badge variant="outline" className="bg-green-100 text-green-800">Completada</Badge>;
    case 'expired':
      return <Badge variant="outline" className="bg-red-100 text-red-800">Expirada</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}
