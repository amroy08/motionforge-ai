import type { Metadata } from "next";
import Link from "next/link";
import { LogIn } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to your MotionForge AI account to transform ideas into stunning videos.",
};

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your MotionForge AI account to continue creating."
      icon={<LogIn className="h-5 w-5" />}
    >
      <LoginForm />
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href={routes.register} className="text-primary hover:underline font-medium">
          Get Started
        </Link>
      </div>
    </AuthCard>
  );
}
