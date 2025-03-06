
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import TokenVerificationComponent from "./Register/components/TokenVerificationComponent";
import RegistrationForm from "./Register/components/RegistrationForm";

export default function Register() {
  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState<any>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const token = searchParams.get("token");

  const handleVerificationComplete = (verifiedInvitation: any | null, error: string | null) => {
    setInvitation(verifiedInvitation);
    setTokenError(error);
  };

  if (invitation) {
    return <RegistrationForm invitation={invitation} />;
  }

  return (
    <TokenVerificationComponent 
      token={token}
      onVerificationComplete={handleVerificationComplete}
    />
  );
}
