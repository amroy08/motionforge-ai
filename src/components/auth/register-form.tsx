"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

import { registerAction } from "@/app/(auth)/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PasswordField } from "./password-field";
import { PasswordRequirements } from "./password-requirements";
import { SubmitButton } from "./submit-button";
import type { AuthActionState } from "@/lib/auth/action-state";

const initialState: AuthActionState = {
  status: "idle",
};

export function RegisterForm() {
  const [state, formAction] = useActionState(registerAction, initialState);
  const [passwordValue, setPasswordValue] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Registration Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5 text-left">
        <Label htmlFor="full_name" className="text-sm font-medium text-foreground">
          Full name
        </Label>
        <Input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          className="bg-background"
        />
        {state.fieldErrors?.full_name && (
          <p className="text-xs text-destructive">{state.fieldErrors.full_name[0]}</p>
        )}
      </div>

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

      <div className="space-y-2">
        <div className="space-y-1.5 text-left">
          <Label htmlFor="password_input" className="text-sm font-medium text-foreground">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password_input"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              className="bg-background"
            />
          </div>
          {state.fieldErrors?.password && (
            <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>
        <PasswordRequirements value={passwordValue} />
      </div>

      <PasswordField
        id="confirm_password"
        name="confirm_password"
        label="Confirm password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm_password}
      />

      <div className="space-y-2 text-left">
        <div className="flex items-start gap-2">
          <input
            id="terms_accepted"
            name="terms_accepted"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
          />
          <Label htmlFor="terms_accepted" className="text-xs text-muted-foreground leading-normal">
            I agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </Label>
        </div>
        {state.fieldErrors?.terms_accepted && (
          <p className="text-xs text-destructive">{state.fieldErrors.terms_accepted[0]}</p>
        )}
      </div>

      <SubmitButton className="w-full mt-2">Create Account</SubmitButton>
    </form>
  );
}
