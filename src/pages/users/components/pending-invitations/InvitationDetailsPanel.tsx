
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { UserInvitation } from "../../types";
import { supabase } from "@/lib/supabase";

interface InvitationDetailsPanelProps {
  invitation: UserInvitation;
}

export function InvitationDetailsPanel({ invitation }: InvitationDetailsPanelProps) {
  return (
    <div className="p-2 text-sm">
      <h4 className="font-semibold mb-2">Información de invitación</h4>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <div>
          <p><span className="font-medium">ID:</span> {invitation.id}</p>
          <p><span className="font-medium">Token:</span> {invitation.invitation_token || "No disponible"}</p>
          <p><span className="font-medium">Estado:</span> {invitation.status}</p>
        </div>
        <div>
          <p><span className="font-medium">Creado:</span> {format(new Date(invitation.created_at), 'dd/MM/yyyy HH:mm:ss')}</p>
          <p><span className="font-medium">URL de inscripción:</span></p>
          <div className="flex items-center">
            <code className="text-xs bg-muted p-1 rounded">{`${window.location.origin}/register?token=${invitation.invitation_token || ''}`}</code>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 ml-1"
              onClick={() => {
                if (invitation.invitation_token) {
                  navigator.clipboard.writeText(`${window.location.origin}/register?token=${invitation.invitation_token}`);
                }
              }}
              disabled={!invitation.invitation_token}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-3">
        <h5 className="font-semibold mb-1">Logs de invitación</h5>
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
              alert("Logs mostrados en consola");
            } catch (err) {
              console.error("Error fetching logs:", err);
            }
          }}
        >
          Ver logs en consola
        </Button>
      </div>
    </div>
  );
}
