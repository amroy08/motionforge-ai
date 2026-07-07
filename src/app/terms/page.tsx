import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Scale className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Terms of Service</CardTitle>
          <p className="text-xs text-muted-foreground">Last updated: July 7, 2026</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-left text-sm text-muted-foreground leading-relaxed">
          <AlertNotice />
          
          <h2 className="text-base font-semibold text-foreground mt-6">1. Acceptance of Terms</h2>
          <p>
            By accessing or using MotionForge AI, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
          </p>

          <h2 className="text-base font-semibold text-foreground">2. Description of Service</h2>
          <p>
            MotionForge AI provides web-based AI tools for image and video generation. The service is provided &quot;as is&quot; and &quot;as available&quot; for evaluation and development purposes.
          </p>

          <h2 className="text-base font-semibold text-foreground">3. User Accounts</h2>
          <p>
            You are responsible for safeguarding your account details. Any activity performed under your credentials remains your responsibility.
          </p>

          <div className="pt-6 border-t border-border/40 text-center">
            <Button variant="outline" size="sm" render={<Link href={routes.register} />}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AlertNotice() {
  return (
    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-foreground/90">
      <strong>Notice:</strong> This document is a placeholder to support user registration flow testing. Formal legal texts are pending review.
    </div>
  );
}
