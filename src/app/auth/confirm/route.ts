import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/auth/redirects";
import { routes, defaultLoginRedirect } from "@/config/navigation";

const VALID_OTP_TYPES: EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") || defaultLoginRedirect;

  const redirectTo = request.nextUrl.clone();
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");

  if (token_hash && type && VALID_OTP_TYPES.includes(type)) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Direct user according to verifyOtp type safely
      let path: string = defaultLoginRedirect;
      if (type === "recovery") {
        path = routes.resetPassword;
      } else {
        path = getSafeRedirectPath(next, defaultLoginRedirect);
        redirectTo.searchParams.set("message", "verified");
      }

      redirectTo.pathname = path;
      redirectTo.searchParams.delete("next");
      return NextResponse.redirect(redirectTo);
    }
  }

  // Redirect to login with error if verification fails
  redirectTo.pathname = routes.login;
  redirectTo.searchParams.set("error", "verification_failed");
  redirectTo.searchParams.delete("next");
  return NextResponse.redirect(redirectTo);
}
