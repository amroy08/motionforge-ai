import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routes } from "@/config/navigation";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-8">
      <Card className="w-full max-w-2xl border-border/50 bg-card/50 backdrop-blur-xl">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 border border-primary/20 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Privacy Policy</CardTitle>
          <p className="text-xs text-muted-foreground">Last updated: July 7, 2026</p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4 text-left text-sm text-muted-foreground leading-relaxed">
          <AlertNotice />
          
          <h2 className="text-base font-semibold text-foreground mt-6">1. Information Collection</h2>
          <p>
            We collect the information you provide directly to us, such as email addresses, user configurations, and metadata necessary to run AI generations.
          </p>

          <h2 className="text-base font-semibold text-foreground">2. Use of Information</h2>
          <p>
            Your information is used solely to authenticate your access, track transaction ledger status, manage credits, and provide the generation services.
          </p>

          <h2 className="text-base font-semibold text-foreground">3. Security</h2>
          <p>
            We utilize cookie-based token validation with secure server-side session checks to safeguard your operational data. No credit cards or payment secrets are stored on our servers.
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
