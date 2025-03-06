
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserInvitations } from "../hooks/useUserInvitations";
import { InvitationsTable } from "./pending-invitations/InvitationsTable";

export function PendingInvitations() {
  const { invitations, resendInvitation, isResending, isLoading } = useUserInvitations();

  if (isLoading) {
    return (
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Invitaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!invitations?.length) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Invitaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <InvitationsTable 
          invitations={invitations}
          resendInvitation={resendInvitation}
          isResending={isResending}
        />
      </CardContent>
    </Card>
  );
}
