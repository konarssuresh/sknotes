import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/features/auth/sign-up-form";
export const metadata = {
  title: "Sign up — SKNotes",
};

export default function SignUpPage() {
  return (
    <AuthCard>
      <SignUpForm />
    </AuthCard>
  );
}
