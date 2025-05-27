
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InviteUserForm } from "../InviteUserForm";

export function UserInvitationSection() {
  return (
    <Card className="mb-6">
      <CardHeader className="py-3 sm:py-4">
        <CardTitle className="text-base sm:text-lg">Invitar Nuevo Usuario</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <InviteUserForm />
      </CardContent>
    </Card>
  );
}
