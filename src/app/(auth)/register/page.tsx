import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join MotionForge AI to start transforming your images and prompts into dynamic videos.",
};

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start generating AI videos in seconds. No credit card required."
      icon={<UserPlus className="h-5 w-5" />}
    >
      <RegisterForm />
      <div className="mt-4 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href={routes.login} className="text-primary hover:underline font-medium">
          Log In
        </Link>
      </div>
    </AuthCard>
  );
}
