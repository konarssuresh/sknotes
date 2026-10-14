import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/features/auth/login-form";
export const metadata = {
  title: "Sign in — SKNotes",
};

export default function LoginPage() {
  return (
    <AuthCard>
      <LoginForm />
    </AuthCard>
  );
}
