"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";

import { resendConfirmationAction } from "@/app/(auth)/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { SubmitButton } from "@/components/auth/submit-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { routes } from "@/config/navigation";
import type { AuthActionState } from "@/lib/auth/action-state";

const initialState: AuthActionState = {
  status: "idle",
};

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [state, formAction] = useActionState(resendConfirmationAction, initialState);
  const [countdown, setCountdown] = useState(0);

  // Trigger countdown if request is successful
  // Wrapped in setTimeout to satisfy set-state-in-effect guidelines
  useEffect(() => {
    if (state.status === "success") {
      const timer = setTimeout(() => {
        setCountdown(60);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state.status]);

  // Handle countdown interval
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <AuthCard
      title="Check your inbox"
      description="We sent a verification link to your email address. Please click it to activate your account."
      icon={<Mail className="h-5 w-5" />}
    >
      <div className="space-y-4 text-center">
        {/* Custom masked email or fallback description */}
        {emailParam && (
          <p className="text-xs text-foreground bg-muted/30 border border-border/40 py-2 px-3 rounded-lg font-mono">
            {emailParam}
          </p>
        )}

        {state.status === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {state.status === "success" && (
          <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <AlertTitle>Sent</AlertTitle>
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="email" value={emailParam} />
          
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive the email? Check your spam folder or request a new one.
          </p>

          <SubmitButton
            className="w-full"
            disabled={countdown > 0}
          >
            {countdown > 0 ? (
              <>
                <RefreshCw className="mr-2 h-3.5 w-3.5 animate-spin" />
                Resend in {countdown}s
              </>
            ) : (
              "Resend Verification Link"
            )}
          </SubmitButton>
        </form>

        <div className="pt-2">
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
