import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "إنشاء حساب" };

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}
