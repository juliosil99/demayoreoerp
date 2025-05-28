
import { useTokenVerification } from "./hooks/useTokenVerification";
import { useRegistrationSubmit } from "./hooks/useRegistrationSubmit";
import { LoadingState } from "./components/LoadingState";
import { InvitationError } from "./components/InvitationError";
import { RegistrationForm } from "./components/RegistrationForm";

export default function Register() {
  const { verifyingToken, invitation, companyName, tokenError } = useTokenVerification();
  const { loading, handleSubmit } = useRegistrationSubmit();

  if (verifyingToken) {
    return <LoadingState />;
  }

  if (tokenError) {
    return <InvitationError error={tokenError} />;
  }

  if (!invitation) {
    return <InvitationError error="No se pudo cargar la invitación" />;
  }

  return (
    <RegistrationForm
      invitation={invitation}
      companyName={companyName}
      loading={loading}
      onSubmit={handleSubmit}
    />
  );
}
