
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
        <CardHeader className="py-3 sm:py-4">
          <CardTitle className="text-base sm:text-lg">Invitaciones</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <Skeleton className="h-[200px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!invitations?.length) return null;

  return (
    <Card className="mb-8">
      <CardHeader className="py-3 sm:py-4">
        <CardTitle className="text-base sm:text-lg">Invitaciones</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <InvitationsTable 
          invitations={invitations}
          onResend={resendInvitation}
          isResending={isResending}
        />
      </CardContent>
    </Card>
  );
}
