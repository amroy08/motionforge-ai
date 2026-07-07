"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { loginAction } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordField } from "./password-field";
import { SubmitButton } from "./submit-button";
import { routes } from "@/config/navigation";
import type { AuthActionState } from "@/lib/auth/action-state";

const initialState: AuthActionState = {
  status: "idle",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "";
  const errorParam = searchParams.get("error");
  const messageParam = searchParams.get("message");

  const [state, formAction] = useActionState(loginAction, initialState);

  // Map incoming URL error codes to safe messages
  let systemMessage = "";
  let systemStatus: "error" | "success" | null = null;

  if (errorParam === "account_inactive") {
    systemMessage = "Your account is currently suspended or deleted. Please contact support.";
    systemStatus = "error";
  } else if (errorParam === "forbidden") {
    systemMessage = "You do not have permission to access that area.";
    systemStatus = "error";
  } else if (errorParam === "verification_failed") {
    systemMessage = "The verification code is invalid or has expired.";
    systemStatus = "error";
  }

  if (messageParam === "password_updated") {
    systemMessage = "Your password has been reset successfully. Please log in with your new password.";
    systemStatus = "success";
  } else if (messageParam === "verified") {
    systemMessage = "Email verified successfully! You can now log in.";
    systemStatus = "success";
  }

  return (
    <form action={formAction} className="space-y-4">
      {/* Hidden input to forward the next redirect path */}
      <input type="hidden" name="next" value={next} />

      {/* Action-state Alerts */}
      {state.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      {systemStatus === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Blocked</AlertTitle>
          <AlertDescription>{systemMessage}</AlertDescription>
        </Alert>
      )}

      {systemStatus === "success" && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{systemMessage}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5 text-left">
        <Label htmlFor="email" className="text-sm font-medium text-foreground">
          Email address
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="bg-background"
        />
        {state.fieldErrors?.email && (
          <p className="text-xs text-destructive">{state.fieldErrors.email[0]}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password"></Label>
          <Link
            href={routes.forgotPassword}
            className="text-xs text-primary hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <PasswordField
          id="password"
          name="password"
          label="Password"
          autoComplete="current-password"
          required
          error={state.fieldErrors?.password}
        />
      </div>

      <SubmitButton className="w-full mt-2">Log In</SubmitButton>
    </form>
  );
}
