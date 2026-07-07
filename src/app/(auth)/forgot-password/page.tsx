import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset link to recover access to your MotionForge AI account.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email address and we'll send you a link to reset your password."
      icon={<KeyRound className="h-5 w-5" />}
    >
      <ForgotPasswordForm />
      <div className="mt-4 text-center">
        <Link
          href={routes.login}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to login
        </Link>
      </div>
    </AuthCard>
  );
}
