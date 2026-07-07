import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { routes } from "@/config/navigation";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] animate-glow-pulse" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-primary/10 blur-[100px] animate-glow-pulse" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32 lg:px-8 lg:pb-36 lg:pt-40">
        <div className="flex flex-col items-center text-center">
          {/* Badge */}
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium animate-fade-in"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            AI-Powered Video Generation
          </Badge>

          {/* Heading */}
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight text-foreground animate-slide-up sm:text-5xl md:text-6xl lg:text-7xl">
            Transform Ideas into{" "}
            <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Stunning Videos
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 max-w-2xl text-base text-muted-foreground animate-slide-up sm:text-lg md:text-xl [animation-delay:100ms]">
            Upload an image, write a prompt, and let AI bring your vision to
            life. Create professional-quality videos in minutes — no editing
            skills required.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col gap-3 animate-slide-up sm:flex-row sm:gap-4 [animation-delay:200ms]">
            <Button
              size="lg"
              className="gap-2 text-base"
              render={<Link href={routes.register} />}
            >
              Start Creating
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2 text-base"
              render={<Link href="#pricing" />}
            >
              <Play className="h-4 w-4" />
              View Pricing
            </Button>
          </div>

          {/* Visual preview area */}
          <div className="mt-16 w-full max-w-4xl animate-slide-up [animation-delay:300ms]">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border/50 bg-card/50 shadow-2xl shadow-primary/5">
              {/* Gradient placeholder for preview */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-muted-foreground/60">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/20">
                    <Play className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-medium">
                    AI-generated video preview
                  </p>
                </div>
              </div>
              {/* Decorative grid overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0_/_3%)_1px,transparent_1px),linear-gradient(to_bottom,oklch(1_0_0_/_3%)_1px,transparent_1px)] bg-[size:48px_48px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
