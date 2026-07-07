import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

import { getCurrentUser } from "@/lib/supabase/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your MotionForge AI account.",
};

export default async function ResetPasswordPage() {
  // Authoritative server-side session check
  const user = await getCurrentUser();

  if (!user) {
    return (
      <AuthCard
        title="Invalid reset session"
        description="Your password reset link is invalid or has expired. Please request a new link."
        icon={<ShieldCheck className="h-5 w-5 text-destructive" />}
      >
        <div className="space-y-4 text-center">
          <p className="text-xs text-muted-foreground">
            Password reset requires a valid authenticated recovery session.
          </p>
          <div className="pt-2">
            <Link
              href={routes.forgotPassword}
              className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              Request new reset link
            </Link>
          </div>
          <div className="pt-2 border-t border-border/30">
            <Link
              href={routes.login}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </div>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Create new password"
      description="Enter your new password below to secure your account."
      icon={<ShieldCheck className="h-5 w-5" />}
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
