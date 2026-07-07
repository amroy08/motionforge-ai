import Link from "next/link";
import { Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/navigation";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2 bg-background">
      {/* Left Panel: Desktop values and styling */}
      <div className="relative hidden flex-col justify-between bg-zinc-950 p-10 text-white lg:flex border-r border-border/20 overflow-hidden">
        {/* Background glow animations */}
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />

        <Link
          href={routes.home}
          className="relative z-20 flex items-center gap-2.5 font-semibold text-lg hover:opacity-80 transition-opacity"
        >
          <div className="flex h-8.5 w-8.5 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
            <Sparkles className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="font-bold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </Link>

        <div className="relative z-20 space-y-6">
          <blockquote className="space-y-2">
            <p className="text-2xl font-bold tracking-tight bg-gradient-to-r from-foreground via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              &quot;Transform Ideas into Stunning Visual Realities.&quot;
            </p>
            <footer className="text-sm text-zinc-400">
              Generate premium AI images and high-fidelity video sequences instantly using state-of-the-art architectures.
            </footer>
          </blockquote>
        </div>

        <div className="relative z-20 text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Content Card */}
      <div className="flex flex-col justify-center items-center p-4 sm:p-8 relative">
        {/* Mobile background decorative glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[300px] w-[300px] rounded-full bg-primary/5 blur-[80px] lg:hidden pointer-events-none" />

        {/* Mobile header (hidden on desktop) */}
        <div className="w-full max-w-md flex justify-start mb-8 lg:hidden">
          <Link href={routes.home} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-bold tracking-tight text-foreground">
              {siteConfig.name}
            </span>
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
