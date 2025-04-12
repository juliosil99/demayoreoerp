
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { UserInvitation } from "../../types";
import { supabase } from "@/lib/supabase";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface InvitationDetailsPanelProps {
  invitation: UserInvitation;
}

export function InvitationDetailsPanel({ invitation }: InvitationDetailsPanelProps) {
  const handleCopyLink = () => {
    if (invitation.invitation_token) {
      navigator.clipboard.writeText(`${window.location.origin}/register?token=${invitation.invitation_token}`);
      toast.success("URL copiada al portapapeles");
    }
  };
  
  return (
    <div className="p-2 sm:p-4 text-sm">
      <h4 className="font-semibold mb-2 text-sm sm:text-base">Información de invitación</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
        <div>
          <p className="text-xs sm:text-sm"><span className="font-medium">ID:</span> {invitation.id}</p>
          <p className="text-xs sm:text-sm"><span className="font-medium">Token:</span> {invitation.invitation_token || "No disponible"}</p>
          <p className="text-xs sm:text-sm"><span className="font-medium">Estado:</span> {invitation.status}</p>
        </div>
        <div>
          <p className="text-xs sm:text-sm"><span className="font-medium">Creado:</span> {format(new Date(invitation.created_at), 'dd/MM/yyyy HH:mm:ss')}</p>
          <div className="text-xs sm:text-sm"><span className="font-medium">URL de inscripción:</span></div>
          <div className="flex flex-col sm:flex-row sm:items-center mt-1">
            <code className="text-[10px] sm:text-xs bg-muted p-1 rounded truncate max-w-[280px] sm:max-w-[400px] block">{`${window.location.origin}/register?token=${invitation.invitation_token || ''}`}</code>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-1 mt-1 sm:mt-0"
              onClick={handleCopyLink}
              disabled={!invitation.invitation_token}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <h5 className="font-semibold mb-1 text-xs sm:text-sm">Logs de invitación</h5>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={async () => {
            try {
              const { data, error } = await supabase
                .from('invitation_logs')
                .select('*')
                .eq('invitation_id', invitation.id)
                .order('created_at', { ascending: false });
                
              if (error) throw error;
              
              console.log("Invitation logs:", data);
              toast.success("Logs mostrados en consola");
            } catch (err) {
              console.error("Error fetching logs:", err);
              toast.error("Error al consultar logs");
            }
          }}
        >
          Ver logs en consola
        </Button>
      </div>
    </div>
  );
}
