
import { LoginForm } from "./components/LoginForm";
import { useLogin } from "./hooks/useLogin";

export default function Login() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleSubmit
  } = useLogin();

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <LoginForm
        email={email}
        password={password}
        isLoading={isLoading}
        onEmailChange={(e) => setEmail(e.target.value)}
        onPasswordChange={(e) => setPassword(e.target.value)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
