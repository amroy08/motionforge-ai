"use client";

import { Check, X } from "lucide-react";

interface PasswordRequirementsProps {
  value: string;
}

export function PasswordRequirements({ value }: PasswordRequirementsProps) {
  const reqs = [
    { label: "8 or more characters", met: value.length >= 8 },
    { label: "At least one uppercase letter", met: /[A-Z]/.test(value) },
    { label: "At least one lowercase letter", met: /[a-z]/.test(value) },
    { label: "At least one number", met: /[0-9]/.test(value) },
    { label: "At least one special character", met: /[^A-Za-z0-9]/.test(value) },
  ];

  if (!value) return null;

  return (
    <div className="space-y-1.5 rounded-lg border border-border/40 bg-muted/30 p-3 text-left">
      <p className="text-xs font-semibold text-foreground">Password strength hints:</p>
      <ul className="space-y-1">
        {reqs.map((req, i) => (
          <li key={i} className="flex items-center gap-1.5 text-xs">
            {req.met ? (
              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            ) : (
              <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            )}
            <span className={req.met ? "text-foreground" : "text-muted-foreground"}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
