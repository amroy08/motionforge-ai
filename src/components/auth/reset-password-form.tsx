"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "lucide-react";

import { resetPasswordAction } from "@/app/(auth)/actions";
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

export function ResetPasswordForm() {
  const [state, formAction] = useActionState(resetPasswordAction, initialState);
  const [passwordValue, setPasswordValue] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      {state.status === "error" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Update Failed</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="space-y-1.5 text-left">
          <Label htmlFor="password_input" className="text-sm font-medium text-foreground">
            New Password
          </Label>
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
          {state.fieldErrors?.password && (
            <p className="text-xs text-destructive">{state.fieldErrors.password[0]}</p>
          )}
        </div>
        <PasswordRequirements value={passwordValue} />
      </div>

      <PasswordField
        id="confirm_password"
        name="confirm_password"
        label="Confirm new password"
        autoComplete="new-password"
        required
        error={state.fieldErrors?.confirm_password}
      />

      <SubmitButton className="w-full mt-2">Update Password</SubmitButton>
    </form>
  );
}
