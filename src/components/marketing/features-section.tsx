import {
  Upload,
  Wand2,
  Film,
  Download,
  Zap,
  Shield,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Upload,
    title: "Upload & Prompt",
    description:
      "Upload any image and describe your vision. Our AI understands context, motion, and style to create exactly what you imagine.",
  },
  {
    icon: Wand2,
    title: "AI-Powered Generation",
    description:
      "Choose from cutting-edge AI models. Select duration, aspect ratio, and let the AI transform your static image into a dynamic video.",
  },
  {
    icon: Film,
    title: "Preview & Download",
    description:
      "Watch your creations come to life with real-time progress tracking. Download in high quality, ready for any platform.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Generations complete in minutes, not hours. Our infrastructure is optimized for speed without compromising quality.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your uploads and creations are private by default. Enterprise-grade security protects your creative work at every step.",
  },
  {
    icon: Download,
    title: "Credit-Based Pricing",
    description:
      "Pay only for what you use with transparent credit-based pricing. No hidden fees, automatic refunds for failed generations.",
  },
] as const;

export function FeaturesSection() {
  return (
    <section id="features" className="border-t border-border/40 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
        {/* Section header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need to create
          </h2>
          <p className="mt-4 text-base text-muted-foreground sm:text-lg">
            A complete AI video generation studio with powerful features
            designed for creators, marketers, and teams.
          </p>
        </div>

        {/* Feature cards */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative overflow-hidden border-border/50 bg-card/50 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
                {/* Hover glow */}
                <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-primary/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
