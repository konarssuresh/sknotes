import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/features/auth/forgot-password-form";

export const metadata = {
  title: "Forgot password — SKNotes",
};

export default async function ForgotPasswordPage(props) {
  const searchParams = await props.searchParams;
  const token = searchParams?.token;

  return (
    <AuthCard title={token ? "Set a new password" : "Forgot password"}>
      <ForgotPasswordForm resetToken={token} />
    </AuthCard>
  );
}
