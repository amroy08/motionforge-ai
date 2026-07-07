"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { siteConfig } from "@/config/site";
import { routes } from "@/config/navigation";
import { logoutAction } from "@/app/(auth)/actions";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
] as const;

interface NavbarProps {
  user: { email: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href={routes.home}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            {siteConfig.name}
          </span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Button variant="ghost" size="sm" render={<Link href={routes.dashboard} />}>
                <LayoutDashboard className="mr-1.5 h-4 w-4" />
                Dashboard
              </Button>
              <form action={logoutAction}>
                <Button variant="outline" size="sm" type="submit">
                  <LogOut className="mr-1.5 h-4 w-4" />
                  Log Out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" render={<Link href={routes.login} />}>
                Log In
              </Button>
              <Button size="sm" render={<Link href={routes.register} />}>
                Get Started
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            className="md:hidden"
            render={
              <Button variant="ghost" size="icon" aria-label="Open menu" />
            }
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </SheetTrigger>
          <SheetContent side="right" className="w-72 border-border/40 bg-card/95 backdrop-blur-xl">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <div className="flex flex-col gap-6 pt-6">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className="flex flex-col gap-2 border-t border-border pt-4">
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      render={<Link href={routes.dashboard} onClick={() => setOpen(false)} />}
                    >
                      <LayoutDashboard className="mr-1.5 h-4 w-4" />
                      Dashboard
                    </Button>
                    <form action={logoutAction} className="w-full">
                      <Button variant="ghost" className="w-full" type="submit">
                        <LogOut className="mr-1.5 h-4 w-4" />
                        Log Out
                      </Button>
                    </form>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      render={<Link href={routes.login} onClick={() => setOpen(false)} />}
                    >
                      Log In
                    </Button>
                    <Button
                      render={<Link href={routes.register} onClick={() => setOpen(false)} />}
                    >
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
